import chalk from "chalk";
import fs from "fs";
import path from "path";
import type {
  LOG_LEVELS_TYPE,
  LogLevel,
  NSL_CONFIG,
  SERVER_LOGGER_PROPS,
  WebSocketResponse,
  LogEntry,
  WebSocketMessage,
  MonitoringConfig,
  PerformanceMetrics,
} from "./types/type";
import crypto from "crypto";
import {
  USE_DEFAULT_LOGGER,
  createLoggerConfig,
  formatLogFileName,
} from "./utils/logger.util";
import { LogAnalyzer } from "./analytics/LogAnalyzer";
import { EventEmitter } from "events";
import WebSocket from "ws";
import { NHX_CONFIG } from "../web/shared/config/logger.conf";
import {
  LogPersistenceService,
  LogRotationConfig,
} from "./services/LogPersistenceService";
import { PerformanceMonitoringService } from "./services/PerformanceMonitoringService";

// Niveaux de log disponibles
const LOG_LEVELS: LOG_LEVELS_TYPE = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  log: 4,
  debug: 5,
};

// Couleurs pour les différents niveaux de log
const LOG_COLORS = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.blue,
  log: chalk.white,
  debug: chalk.green,
};

export class NehonixSmartLogger extends EventEmitter {
  private static instance: NehonixSmartLogger;
  private lastGroupTimes: Record<string, number> = {};
  private currentLogLevel: number;
  private analyzer: LogAnalyzer;
  private wsClient: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 3000;
  private userId?: string;
  private userUid?: string;
  private appId?: string;
  private persistenceService: LogPersistenceService;
  private monitoringService: PerformanceMonitoringService;
  private config: NSL_CONFIG | null = null;
  private configPath: string = "";

  private constructor() {
    super();
    this.currentLogLevel = LOG_LEVELS.debug; // Valeur par défaut
    this.analyzer = LogAnalyzer.getInstance();
    this.persistenceService = LogPersistenceService.getInstance();
    this.monitoringService = PerformanceMonitoringService.getInstance();
    this.connectToWebSocket();
  }

  public static from(configPath: string): NehonixSmartLogger {
    const instance = NehonixSmartLogger.getInstance();

    // On utilise process.cwd() qui donne le répertoire de travail actuel
    const currentDir = process.cwd();
    // Résoudre le chemin relatif par rapport au répertoire de travail
    instance.configPath = path.resolve(currentDir, configPath);

    return instance;
  }

  public import(configName: string): NehonixSmartLogger {
    try {
      const configPath = path.join(this.configPath, configName);
      console.log(chalk.yellowBright("Loading config from:", configPath));
      const configContent = fs.readFileSync(configPath, "utf-8");
      console.log(chalk.green("Config loaded successfully"));
      this.config = JSON.parse(configContent) as NSL_CONFIG;
      this.currentLogLevel =
        LOG_LEVELS[
          this.config.logLevel?.toLowerCase() as keyof LOG_LEVELS_TYPE
        ] || LOG_LEVELS.debug;
      this.setCredentials(this.config.user.userId, this.config.app.appId);
      return this;
    } catch (error) {
      throw new Error(
        "Erreur lors de l'importation de la configuration: " + error
      );
    }
  }

  public async initialize(config: {
    persistence?: LogRotationConfig;
    monitoring?: MonitoringConfig;
  }): Promise<void> {
    if (this.config) {
      // Mise à jour du niveau de log depuis la configuration
      this.currentLogLevel =
        LOG_LEVELS[
          this.config.logLevel?.toLowerCase() as keyof LOG_LEVELS_TYPE
        ] || LOG_LEVELS.debug;
    }

    if (config.persistence) {
      await this.persistenceService.initialize(config.persistence);
    }
    if (config.monitoring) {
      await this.monitoringService.initialize(config.monitoring);
      this.monitoringService.on("metrics", (metrics) => {
        this.handleMetrics(metrics);
      });
    }
  }

  private connectToWebSocket(): void {
    try {
      this.wsClient = new WebSocket(NHX_CONFIG._global_.__WEBSOCKET_URL__);

      this.wsClient.on("open", () => {
        console.log("NehonixSmartLogger connecté au serveur WebSocket");
        this.reconnectAttempts = 0;
        if (!this.userId || !this.appId) {
          throw new Error(
            "Fill your credentials to connect to the server, use the setCredentials method or import a config file"
          );
        }

        this.authenticate();
      });

      this.wsClient.on("message", (data: string) => {
        this.handleMessage(JSON.parse(data) as WebSocketResponse);
      });

      this.wsClient.on("error", (error) => {
        throw new Error("Error while connecting to the WebSocket: " + error);
      });

      this.wsClient.on("close", () => {
        this.handleReconnect();
      });
    } catch (error) {
      throw new Error("Error while connecting to the WebSocket: " + error);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );
      setTimeout(() => this.connectToWebSocket(), this.reconnectDelay);
    }
  }

  private authenticate(): void {
    console.log("Authentificating with: ", {
      userId: this.userId,
      appId: this.appId,
    });
    if (
      this.wsClient?.readyState === WebSocket.OPEN &&
      this.userId &&
      this.appId
    ) {
      const authMessage: WebSocketMessage = {
        type: "auth",
        data: {
          userId: this.userId,
          appId: this.appId,
        },
      };
      this.wsClient.send(JSON.stringify(authMessage));
    }
  }

  private handleMessage(message: WebSocketResponse): void {
    console.log("got message", message);
    switch (message.type) {
      case "logs":
        if (message.payload.logs) {
          this.handleLogs(message.payload.logs);
        }
        break;
      case "metrics":
        if (message.payload.metrics) {
          this.handleMetrics(message.payload.metrics);
        }
        break;
      case "connect":
        if (message.payload.appId && message.payload.userId) {
          this.setCredentials(message.payload.userId, message.payload.appId);
        }
        break;
      // case "auth_success":
      //   break;
      case "auth_error":
        throw new Error("Auth error: " + message.payload.message);
    }
  }

  private handleLogs(logs: LogEntry[]): void {
    logs.forEach((log) => {
      this.emit("log", log);
    });
  }

  private handleMetrics(metrics: PerformanceMetrics): void {
    this.emit("metrics", metrics);
  }

  private handleHistory(logs: LogEntry[]): void {
    this.emit("history", logs);
  }

  private handleClear(): void {
    this.emit("clear");
  }

  public setCredentials(userId: string, appId: string): void {
    this.userId = userId;
    this.appId = appId;
    if (this.wsClient?.readyState === WebSocket.OPEN) {
      this.authenticate();
    }
  }

  public setFilters(filters: { level?: string[]; appId?: string }): void {
    if (this.wsClient?.readyState === WebSocket.OPEN) {
      const filterMessage: WebSocketMessage = {
        type: "filter",
        data: {
          userId: this.userId || "",
          appId: this.appId || "",
          level: filters.level,
        },
      };
      this.wsClient.send(JSON.stringify(filterMessage));
    }
  }

  public clearLogs(): void {
    if (this.wsClient?.readyState === WebSocket.OPEN) {
      const clearMessage: WebSocketMessage = {
        type: "clear",
      };
      this.wsClient.send(JSON.stringify(clearMessage));
    }
  }

  public static getInstance(): NehonixSmartLogger {
    if (!NehonixSmartLogger.instance) {
      NehonixSmartLogger.instance = new NehonixSmartLogger();
    }
    return NehonixSmartLogger.instance;
  }

  private formatMessage(
    timestamp: string,
    level: string,
    messages: unknown[]
  ): string {
    const messageText = messages
      .map((m) =>
        typeof m === "object" ? JSON.stringify(m, null, 2) : String(m)
      )
      .join(" ");
    return `[${timestamp}] [${level.toUpperCase()}]: ${messageText}`;
  }

  private getColoredMessage(message: string, level: string): string {
    return (
      LOG_COLORS[level.toLowerCase() as keyof typeof LOG_COLORS]?.(message) ||
      message
    );
  }

  private writeToConsole(message: string, level: string): void {
    switch (level.toLowerCase()) {
      case "error":
        console.error(message);
        break;
      case "warn":
        console.warn(message);
        break;
      case "info":
        console.info(message);
        break;
      case "debug":
        console.debug(message);
        break;
      default:
        console.log(message);
    }
  }

  private async writeToFile(
    logPath: string,
    message: string,
    options: SERVER_LOGGER_PROPS,
    timestamp: string
  ): Promise<void> {
    try {
      if (options.logMode?.enable) {
        const rotationConfig: LogRotationConfig = {
          maxSize: options.logMode.maxSize || 100, // 100MB par défaut
          maxFiles: options.logMode.maxFiles || 10,
          compress: options.logMode.compress || false,
          interval: options.logMode.rotationInterval || "daily",
        };

        await this.persistenceService.writeLog(
          logPath,
          message,
          rotationConfig
        );
      }

      // Chiffrement si nécessaire
      if (options.logMode?.crypt?.CRYPT_DATAS?.lockStatus === "enable") {
        const { key, iv = Buffer.alloc(16, 0) } =
          options.logMode.crypt.CRYPT_DATAS;

        if (key) {
          const cipher = crypto.createCipheriv(
            "aes-256-cbc",
            Buffer.from(key, "hex"),
            iv
          );

          let encryptedMessage = cipher.update(message, "utf8", "hex");
          encryptedMessage += cipher.final("hex");

          const encryptedPath = `${logPath}.enc`;
          fs.appendFileSync(encryptedPath, `${encryptedMessage}\n`);
        }
      }
    } catch (error) {
      console.error(chalk.red("Error while writing to log file:", error));
    }
  }

  public async shutdown(): Promise<void> {
    await this.persistenceService.shutdown();
    await this.monitoringService.shutdown();
    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = null;
    }
  }

  public log(...args: unknown[]): void {
    let options: SERVER_LOGGER_PROPS = USE_DEFAULT_LOGGER;
    let messages: unknown[] = args;
    let logLevel: string = "log";

    // Détection du format d'appel
    if (args.length > 0) {
      const firstArg = args[0];

      if (
        typeof firstArg === "object" &&
        firstArg !== null &&
        ("logMode" in firstArg || "typeOrMessage" in firstArg)
      ) {
        options = createLoggerConfig(firstArg as SERVER_LOGGER_PROPS);
        messages = args.slice(1);
        logLevel = (options.typeOrMessage as string) || "log";
      } else if (typeof firstArg === "string" && firstArg in LOG_LEVELS) {
        logLevel = firstArg;
        messages = args.slice(1);
      }
    }

    // Vérification du niveau de log
    const requestedLevelValue =
      LOG_LEVELS[logLevel.toLowerCase() as keyof LOG_LEVELS_TYPE] ||
      LOG_LEVELS.log;
    if (requestedLevelValue > this.currentLogLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = this.formatMessage(timestamp, logLevel, messages);
    const coloredMessage = this.getColoredMessage(formattedMessage, logLevel);

    // Créer l'entrée de log pour le WebSocket
    const logEntry: LogEntry = {
      id: crypto.randomBytes(16).toString("hex"),
      timestamp,
      level: logLevel.toLowerCase() as LogLevel,
      message: messages
        .map((m) => (typeof m === "object" ? JSON.stringify(m) : String(m)))
        .join(" "),
      metadata: messages.find((m) => typeof m === "object") as
        | Record<string, unknown>
        | undefined,
      // appId: this.appId || "",
      // userId: this.userId || "",
    };

    // Envoyer le log au WebSocket
    this.sendLogToWebSocket(logEntry);

    // Analyse du message
    const insights = this.analyzer.analyze(formattedMessage, timestamp, {
      level: logLevel,
      options,
    });

    // Si des insights sont trouvés et que le niveau est error ou warn
    if (insights.length > 0 && (logLevel === "error" || logLevel === "warn")) {
      const suggestions = this.analyzer.generateSuggestions();
      if (suggestions.length > 0) {
        console.log(chalk.cyan("\n🔍 Analyse des logs:"));
        suggestions.forEach((suggestion) =>
          console.log(chalk.yellow(suggestion))
        );
      }

      const anomalies = this.analyzer.detectAnomalies();
      if (anomalies.length > 0) {
        console.log(chalk.red("\n⚡ Anomalies détectées:"));
        anomalies.forEach((anomaly) => {
          console.log(
            chalk.magenta(
              `   - Type: ${anomaly.type}\n` +
                `     Fréquence: ${anomaly.frequency}x en 5 minutes\n` +
                `     Catégorie: ${anomaly.category}\n` +
                `     Sévérité: ${anomaly.severity}`
            )
          );
        });
      }
    }

    // Affichage dans la console
    if (!options.logMode?.enable || options.logMode?.display_log) {
      this.writeToConsole(coloredMessage, logLevel);
    }

    // Écriture dans le fichier
    if (options.logMode?.enable) {
      const logName = formatLogFileName(options.logMode.name || "app");
      const logPath = path.join(process.cwd(), "logs", logName);
      this.writeToFile(logPath, formattedMessage, options, timestamp);
    }
  }

  /**
   * Ajoute un pattern personnalisé pour l'analyse des logs
   */
  public addAnalysisPattern(pattern: {
    pattern: RegExp;
    severity: "low" | "medium" | "high";
    category: string;
    suggestion?: string;
  }): void {
    this.analyzer.addPattern(pattern);
  }

  /**
   * Réinitialise l'analyseur de logs
   */
  public resetAnalyzer(): void {
    this.analyzer.reset();
  }

  private sendLogToWebSocket(logEntry: LogEntry): void {
    if (this.wsClient?.readyState === WebSocket.OPEN) {
      console.log("sendLogToWebSocket", logEntry);
      const message: WebSocketMessage = {
        type: "logs",
        data: {
          userId: this.userId || "",
          appId: this.appId || "",
          logs: [logEntry],
        },
      };
      this.wsClient.send(JSON.stringify(message));
    }
  }
}

// Fonction d'export avec les méthodes d'analyse
interface EnhancedLogger {
  (...args: unknown[]): void;
  addAnalysisPattern(pattern: {
    pattern: RegExp;
    severity: "low" | "medium" | "high";
    category: string;
    suggestion?: string;
  }): void;
  resetAnalyzer(): void;
}

function createLogger(): EnhancedLogger {
  const logger = ((...args: unknown[]) =>
    NehonixSmartLogger.getInstance().log(...args)) as EnhancedLogger;
  logger.addAnalysisPattern = (...args) =>
    NehonixSmartLogger.getInstance().addAnalysisPattern(...args);
  logger.resetAnalyzer = () => NehonixSmartLogger.getInstance().resetAnalyzer();
  return logger;
}

export const NSMLogger = createLogger();
export default NSMLogger;
