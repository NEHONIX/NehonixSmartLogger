import chalk from "chalk";
import fs from "fs";
import path from "path";
import type { SERVER_LOGGER_PROPS } from "./types/type";
import crypto from "crypto";
import {
  USE_DEFAULT_LOGGER,
  createLoggerConfig,
  formatLogFileName,
} from "./utils/logger.util";
import { LogAnalyzer } from "./analytics/LogAnalyzer";

// Niveaux de log disponibles
const LOG_LEVELS: Record<string, number> = {
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

export class NehonixLogger {
  private static instance: NehonixLogger;
  private lastGroupTimes: Record<string, number> = {};
  private currentLogLevel: number;
  private analyzer: LogAnalyzer;

  private constructor() {
    this.currentLogLevel =
      LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase() || "debug"] ||
      LOG_LEVELS.debug;
    this.analyzer = LogAnalyzer.getInstance();
  }

  public static getInstance(): NehonixLogger {
    if (!NehonixLogger.instance) {
      NehonixLogger.instance = new NehonixLogger();
    }
    return NehonixLogger.instance;
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
      fs.mkdirSync(path.dirname(logPath), { recursive: true });

      if (!fs.existsSync(logPath)) {
        const header = `${path
          .basename(logPath)
          .toUpperCase()} LOG CREATED ON ${new Date().toLocaleString()}\n\n`;
        fs.writeFileSync(logPath, header);
      }

      const fileKey = path.resolve(logPath);
      const currentTime = Date.now();
      const shouldAddGroupMarker =
        !this.lastGroupTimes[fileKey] ||
        currentTime - this.lastGroupTimes[fileKey] >
          (options.groupInterval || 10000);

      if (shouldAddGroupMarker) {
        const groupMarker = `\n=== NEW LOG GROUP AT ${timestamp} ===\n`;
        fs.appendFileSync(logPath, groupMarker);
        this.lastGroupTimes[fileKey] = currentTime;

        if (options.logMode?.saved_message === "enable") {
          console.log(chalk.cyan(groupMarker));
        }
      }

      fs.appendFileSync(logPath, `${message}\n`);

      if (options.logMode?.saved_message === "enable") {
        console.log(chalk.gray(`Saved log in: ${logPath}`));
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
      LOG_LEVELS[logLevel.toLowerCase()] || LOG_LEVELS.log;
    if (requestedLevelValue > this.currentLogLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = this.formatMessage(timestamp, logLevel, messages);
    const coloredMessage = this.getColoredMessage(formattedMessage, logLevel);

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
    NehonixLogger.getInstance().log(...args)) as EnhancedLogger;
  logger.addAnalysisPattern = (...args) =>
    NehonixLogger.getInstance().addAnalysisPattern(...args);
  logger.resetAnalyzer = () => NehonixLogger.getInstance().resetAnalyzer();
  return logger;
}

export const nehonixLogger = createLogger();
export default nehonixLogger;
