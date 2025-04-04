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
  UserAction,
  CommandData,
  ConsoleConfig,
} from "./types/type";
import crypto from "crypto";
import { formatLogFileName, LoggerConfig as lgc } from "./utils/logger.util";
import { LogAnalyzer } from "./analytics/LogAnalyzer";
import { EventEmitter } from "events";
import WebSocket from "ws";
import { NHX_CONFIG } from "../web/shared/config/logger.conf";
import {
  LogPersistenceService,
  LogRotationConfig,
} from "./services/LogPersistenceService";
import { PerformanceMonitoringService } from "./services/PerformanceMonitoringService";
import { EncryptionService } from "./services/EncryptionService";

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
  private readonly maxReconnectAttempts: number = 20;
  private readonly reconnectDelay: number = 3000;
  private userId?: string;
  private userUid?: string;
  private appId?: string;
  private persistenceService: LogPersistenceService;
  private monitoringService: PerformanceMonitoringService;
  private encryptionService: EncryptionService;
  private config: NSL_CONFIG | null = null;
  private configPath: string = "";
  private isAuthenticated: boolean = false;
  private pendingLogs: LogEntry[] = [];
  private isRemoteMode: boolean = false;

  private constructor() {
    super();
    this.currentLogLevel = LOG_LEVELS.debug; // Valeur par défaut
    this.analyzer = LogAnalyzer.getInstance();
    this.persistenceService = LogPersistenceService.getInstance();
    this.monitoringService = PerformanceMonitoringService.getInstance();
    this.encryptionService = EncryptionService.getInstance();
    /*activation des commandes par défaut*/
    //Activation de l'affichage des logs dans la console
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
      this.isRemoteMode = true;
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
    // Ne tenter la connexion que si nous sommes en mode distant
    if (!this.isRemoteMode) {
      return;
    }

    try {
      this.wsClient = new WebSocket(NHX_CONFIG._global_.__WEBSOCKET_URL__);

      this.wsClient.on("open", () => {
        console.log("NehonixSmartLogger connecté au serveur WebSocket");
        this.reconnectAttempts = 0;
        this.authenticate();
      });

      this.wsClient.on("message", (data: string) => {
        this.handleMessage(JSON.parse(data) as WebSocketResponse);
      });

      this.wsClient.on("error", (error) => {
        console.error("Error while connecting to the WebSocket:", error);
      });

      this.wsClient.on("close", () => {
        this.handleReconnect();
      });
    } catch (error) {
      console.error("Error while connecting to the WebSocket:", error);
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
    // console.log("Authentificating with: ", {
    //   userId: this.userId,
    //   appId: this.appId,
    // });
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
    // console.log(
    //   chalk.cyanBright("Message received: ", JSON.stringify(message))
    // );
    switch (message.type) {
      case "clear":
        this.clearLogs();
        break;
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
      case "auth_success":
        console.log(
          `Server connected to ${this.appId} for ${message.payload.userId}`
        );
        this.isAuthenticated = true;
        // Envoyer les logs en attente
        this.processPendingLogs();
        // Demander l'historique des logs
        this.requestHistory();
        break;
      case "auth_error":
        this.isAuthenticated = false;
        throw new Error("Auth error: " + message.payload.message);
      case "command":
        this.handleCommand((message as any).data as CommandData);
        break;
      case "request_history":
        console.log(
          chalk.yellowBright("History logs: ", message.payload?.logs)
        );
        this.handleHistory(message.payload?.logs || []);
        break;
      case "get_last_actions":
        this.handleLastActions(message.payload as UserAction[]);
    }
  }

  private handleLastActions(actions: UserAction[]) {
    // console.log(chalk.cyanBright("Last actions: ", JSON.stringify(actions)));
    actions.forEach((action) => {
      this.handleCommand(action.data);
    });
  }
  /***  ws_sent_config?: {
    response_type?: string;
  }; */
  private requestHistory(): void {
    if (this.wsClient?.readyState === WebSocket.OPEN) {
      const historyMessage: WebSocketMessage = {
        type: "history",
        ws_sent_config: {
          response_type: "request_history",
        },
        data: {
          userId: this.userId || "",
          appId: this.appId || "",
        },
      };
      this.wsClient.send(JSON.stringify(historyMessage));
    }
  }
  private handleHistory(logs: LogEntry[]): void {
    this.emit("history", logs);
  }

  private handleCommand(payload: CommandData): void {
    // console.log(
    //   chalk.yellowBright("🔍 Commande reçue:", JSON.stringify(payload))
    // );
    switch (payload.type) {
      case "console_toggle":
        this.handleConsoleToggle(payload.data.enabled);
        break;
      case "encryption_toggle":
        this.handleEncryptionToggle(payload.data.enabled);
        break;
      default:
        console.warn("Commande inconnue:", payload.type);
    }
  }

  private handleConsoleToggle(enabled: boolean): void {
    if (!this.config) return;
    const defaultConsole: ConsoleConfig = {
      showTimestamp: true,
      showLogLevel: true,
      colorized: true,
      format: "detailed",
      enabled: true,
    };

    const currentConsole = this.config.console ?? defaultConsole;

    this.config = {
      ...this.config,
      console: {
        ...currentConsole,
        enabled,
      },
    };
    console.log(`Affichage console ${enabled ? "activé" : "désactivé"}`);
  }

  private handleEncryptionToggle(enabled: boolean): void {
    if (!this.config) return;

    // Si on active le chiffrement et qu'il n'y a pas de clé, en générer une
    const key = enabled
      ? this.config.encryption?.key || this.encryptionService.generateKey
      : undefined;

    this.config = {
      ...this.config,
      encryption: {
        enabled,
        key,
      },
    };
    console.log(`Chiffrement des logs ${enabled ? "activé" : "désactivé"}`);
  }

  private processPendingLogs(): void {
    while (this.pendingLogs.length > 0) {
      const logEntry = this.pendingLogs.shift();
      if (logEntry) {
        this.sendLogToWebSocket(logEntry);
        // Afficher dans la console maintenant que nous sommes authentifiés
        const coloredMessage = this.getColoredMessage(
          this.formatMessage(logEntry.timestamp, logEntry.level, [
            logEntry.message,
          ]),
          logEntry.level
        );
        this.writeToConsole(coloredMessage, logEntry.level);
      }
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

  private handleClear(): void {
    this.emit("clear");
  }

  public setCredentials(userId: string, appId: string): void {
    this.userId = userId;
    this.appId = appId;
    this.isRemoteMode = true;
    // Initier la connexion WebSocket seulement quand les credentials sont définis
    this.connectToWebSocket();
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

    // En mode local ou sans configuration, utiliser le format par défaut
    if (!this.isRemoteMode || !this.config) {
      return `[${timestamp}] [${level.toUpperCase()}] ${messageText}`;
    }

    // En mode distant avec configuration
    const cslConfig = this.config.console;
    const parts = [];

    if (cslConfig?.showTimestamp) {
      parts.push(`[${timestamp}]`);
    }

    if (cslConfig?.showLogLevel) {
      parts.push(`[${level.toUpperCase()}]`);
    }

    parts.push(
      cslConfig?.colorized
        ? this.getColoredMessage(messageText, level)
        : messageText
    );

    return parts.join(" ");
  }

  private getColoredMessage(message: string, level: string): string {
    return (
      LOG_COLORS[level.toLowerCase() as keyof typeof LOG_COLORS]?.(message) ||
      message
    );
  }

  private writeToConsole(message: string, level: string): void {
    // Si le chiffrement est activé, chiffrer le message
    if (this.config?.encryption?.enabled && this.config.encryption.key) {
      const key = this.config.encryption.key;
      try {
        message = this.encryptionService.encrypt(message, key);
      } catch (error) {
        console.error("Error while encrypting message:", error);
        throw new Error("Error while encrypting message:" + error);
      }
    }

    // En mode distant, vérifier si l'affichage console est désactivé
    if (this.isRemoteMode && this.config?.console?.enabled === false) return;

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
          maxSize: options.logMode.maxSize || 100,
          maxFiles: options.logMode.maxFiles || 10,
          compress: options.logMode.compress || false,
          interval: options.logMode.rotationInterval || "daily",
        };

        // Si le chiffrement est activé, chiffrer le message avant de l'écrire
        if (this.config?.encryption?.enabled && this.config.encryption.key) {
          message = this.encryptionService.encrypt(
            message,
            this.config.encryption.key
          );
        }

        await this.persistenceService.writeLog(
          logPath,
          message,
          rotationConfig
        );
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
    let options: SERVER_LOGGER_PROPS = lgc.USE_DEFAULT_LOGGER;
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
        options = lgc.createLoggerConfig(firstArg as SERVER_LOGGER_PROPS);
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

    // Créer l'entrée de log
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
    };

    // Gestion du mode distant
    if (this.isRemoteMode) {
      if (!this.isAuthenticated) {
        // En mode distant non authentifié, stocker les logs pour envoi ultérieur
        this.pendingLogs.push(logEntry);
      } else {
        // En mode distant authentifié, envoyer au WebSocket
        this.sendLogToWebSocket(logEntry);
      }
    }

    // Toujours afficher dans la console en mode local
    // En mode distant, afficher uniquement si authentifié ou si pas de configuration spécifique
    if (!this.isRemoteMode || !options.logMode?.enable) {
      this.writeToConsole(coloredMessage, logLevel);
    }

    // Analyse et gestion des logs locaux
    if (!this.isRemoteMode || this.isAuthenticated) {
      // Analyse du message
      const insights = this.analyzer.analyze(formattedMessage, timestamp, {
        level: logLevel,
        options,
      });

      if (
        insights.length > 0 &&
        (logLevel === "error" || logLevel === "warn")
      ) {
        const suggestions = this.analyzer.generateSuggestions();
        if (suggestions.length > 0) {
          console.log(chalk.cyan("\n Logs analysing...:"));
          suggestions.forEach((suggestion) =>
            console.log(chalk.yellow(suggestion))
          );
        }

        const anomalies = this.analyzer.detectAnomalies();
        if (anomalies.length > 0) {
          console.log(chalk.red("\n Detected anomaly:"));
          anomalies.forEach((anomaly) => {
            console.log(
              chalk.magenta(
                `   - Type: ${anomaly.type}\n` +
                  `     Frequences: ${anomaly.frequency}x in 5 minutes\n` +
                  `     Category: ${anomaly.category}\n` +
                  `     Severity: ${anomaly.severity}`
              )
            );
          });
        }
      }

      // Écriture dans le fichier
      if (options.logMode?.enable) {
        const logName = formatLogFileName(options.logMode.name || "app");
        const logPath = path.join(process.cwd(), "logs", logName);
        this.writeToFile(logPath, formattedMessage, options, timestamp);
      }
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
      // Préparer les métadonnées de chiffrement si nécessaire
      let encryptionMetadata = undefined;

      if (this.config?.encryption?.enabled && this.config.encryption.key) {
        // Générer une clé temporaire unique pour cette transmission
        const transmissionKey = this.encryptionService.generateKey;

        // Chiffrer la clé de chiffrement originale avec la clé temporaire
        const encryptedKey = this.encryptionService.encrypt(
          this.config.encryption.key,
          transmissionKey
        );

        // Chiffrer le message avec la clé originale
        const encryptedMessage = this.encryptionService.encrypt(
          logEntry.message,
          this.config.encryption.key
        );

        // Mettre à jour le message et ajouter les métadonnées
        logEntry = {
          ...logEntry,
          message: encryptedMessage,
          encrypted: true,
        };

        encryptionMetadata = {
          isEncrypted: true,
          transmissionKey,
          encryptedKey,
        };
      }

      const message: WebSocketMessage = {
        type: "logs",
        data: {
          userId: this.userId || "",
          appId: this.appId || "",
          logs: [logEntry],
          encryption: encryptionMetadata,
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
