import fs from "fs";
import path from "path";
import { createGzip } from "zlib";
import { promisify } from "util";
import { pipeline } from "stream";
import { EncryptionService } from "./EncryptionService";
import chalk from "chalk";
import { LogRotationConfig } from "../types/type";

const pipelineAsync = promisify(pipeline);

/**
 *   maxSize: number; // en MB
  maxFiles: number;
  compress: boolean;
  interval: "hourly" | "daily" | "weekly";
 */

const enc = EncryptionService.getInstance();

export class LogPersistenceService {
  private static instance: LogPersistenceService;
  private config: LogRotationConfig | null = null;
  private currentFileSize: number = 0;
  private currentFile: string | null = null;
  private rotationTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): LogPersistenceService {
    if (!LogPersistenceService.instance) {
      LogPersistenceService.instance = new LogPersistenceService();
    }
    // console.log(chalk.blueBright("LogPersistenceService instance created"));
    return LogPersistenceService.instance;
  }

  public async initialize(config: LogRotationConfig): Promise<void> {
    this.config = config;
    // Créer le dossier logs s'il n'existe pas
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Configurer la rotation automatique
    this.setupRotation(config);
  }

  private setupRotation(config: LogRotationConfig): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }

    const interval = this.getRotationInterval(config.interval);
    const logPath = path.join(process.cwd(), "logs", "app.log");

    this.rotationTimer = setInterval(() => {
      this.rotateLogs(logPath, config);
    }, interval);
  }

  private getRotationInterval(interval: "hourly" | "daily" | "weekly"): number {
    switch (interval) {
      case "hourly":
        return 60 * 60 * 1000; // 1 heure
      case "daily":
        return 24 * 60 * 60 * 1000; // 24 heures
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000; // 7 jours
    }
  }

  public async writeLog(
    logPath: string,
    message: string,
    config?: LogRotationConfig
  ): Promise<void> {
    try {
      // S'assurer que le dossier parent existe
      const logDir = path.dirname(logPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Vérifier si le fichier existe
      if (!fs.existsSync(logPath)) {
        // Créer le fichier s'il n'existe pas
        fs.writeFileSync(logPath, "");
      }

      // Écrire le message
      fs.appendFileSync(logPath, message + "\n");

      // Rotation des logs si nécessaire
      const stats = fs.statSync(logPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      const rotationConfig = config || this.config;

      if (rotationConfig && fileSizeInMB >= rotationConfig.maxSize) {
        await this.rotateLogs(logPath, rotationConfig);
      }
    } catch (error) {
      console.error("Erreur lors de l'écriture du log:", error);
    }
  }

  private async rotateLogs(
    logPath: string,
    config: LogRotationConfig
  ): Promise<void> {
    try {
      const logsDir = path.dirname(logPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const newFileName = `app-${timestamp}.log`;
      const newFilePath = path.join(logsDir, newFileName);

      // S'assurer que le dossier existe
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      // Créer le nouveau fichier
      fs.writeFileSync(newFilePath, "");

      // Déplacer le contenu de l'ancien fichier vers le nouveau
      fs.renameSync(logPath, newFilePath);

      // Créer un nouveau fichier vide pour continuer à logger
      fs.writeFileSync(logPath, "");

      // Compression si activée
      if (config.compress) {
        const encryptedLog = enc.encrypt(
          fs.readFileSync(newFilePath, "utf8"),
          enc.generateKey
        );
        fs.writeFileSync(newFilePath, encryptedLog);
      }

      // Nettoyage des anciens fichiers
      await this.cleanOldLogs(logsDir, config.maxFiles);
    } catch (error) {
      console.error("Erreur lors de la rotation des logs:", error);
    }
  }

  private async cleanOldLogs(logsDir: string, maxFiles: number): Promise<void> {
    try {
      const files = fs
        .readdirSync(logsDir)
        .filter((file) => file.endsWith(".log"))
        .map((file) => ({
          name: file,
          path: path.join(logsDir, file),
          time: fs.statSync(path.join(logsDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      // Supprimer les fichiers en trop
      for (let i = maxFiles; i < files.length; i++) {
        fs.unlinkSync(files[i].path);
      }
    } catch (error) {
      console.error("Erreur lors du nettoyage des anciens logs:", error);
    }
  }

  public async shutdown(): Promise<void> {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }
}
