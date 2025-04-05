import type { SERVER_LOGGER_PROPS } from "../types/type";

/**
 * Configuration par défaut du logger
 */
/**
 * Fonction utilitaire pour créer une configuration de logger personnalisée
 * @param config - Configuration partielle du logger
 * @returns Configuration complète du logger
 */
export class LoggerConfig {
  static USE_DEFAULT_LOGGER: SERVER_LOGGER_PROPS = {
    groupInterval: 10000,
    writeFileMode: {
      enable: false,
      log_rotation: {
        maxSize: 100,
        maxFiles: 10,
        compress: false,
        interval: "daily",
      },
      fileName: "nehonix_logger.log",
      saved_message: "enable",
      display_log: false,
      crypt: {
        CRYPT_DATAS: {
          lockStatus: "disable",
          iv: Buffer.alloc(16, 0),
        },
        CRYPT_LOGS: {
          lockStatus: "disable",
          iv: Buffer.alloc(16, 0),
        },
      },
    },
  };

  static createLoggerConfig(
    config?: Partial<SERVER_LOGGER_PROPS>
  ): SERVER_LOGGER_PROPS {
    return {
      groupInterval:
        config?.groupInterval || LoggerConfig.USE_DEFAULT_LOGGER.groupInterval,
      writeFileMode: {
        enable:
          config?.writeFileMode?.enable ??
          LoggerConfig.USE_DEFAULT_LOGGER.writeFileMode?.enable,
        fileName:
          config?.writeFileMode?.fileName ||
          LoggerConfig.USE_DEFAULT_LOGGER.writeFileMode?.fileName,
        saved_message:
          config?.writeFileMode?.saved_message ||
          LoggerConfig.USE_DEFAULT_LOGGER.writeFileMode?.saved_message,
        display_log:
          config?.writeFileMode?.display_log ??
          LoggerConfig.USE_DEFAULT_LOGGER.writeFileMode?.display_log,
        crypt: {
          CRYPT_DATAS: {
            lockStatus:
              config?.writeFileMode?.crypt?.CRYPT_DATAS?.lockStatus ||
              "disable",
            key: config?.writeFileMode?.crypt?.CRYPT_DATAS?.key,
            iv:
              config?.writeFileMode?.crypt?.CRYPT_DATAS?.iv ||
              Buffer.alloc(16, 0),
          },
          CRYPT_LOGS: {
            lockStatus:
              config?.writeFileMode?.crypt?.CRYPT_LOGS?.lockStatus || "disable",
            key: config?.writeFileMode?.crypt?.CRYPT_LOGS?.key,
            iv:
              config?.writeFileMode?.crypt?.CRYPT_LOGS?.iv ||
              Buffer.alloc(16, 0),
          },
        },
      },
    };
  }
}

export const createConfig = LoggerConfig.createLoggerConfig;
/**
 * Fonction utilitaire pour configurer le nom du fichier de log
 * @param name - Nom du fichier de log
 * @returns Nom du fichier de log formaté
 */
export const formatLogFileName = (name: string): string => {
  return name.replace(/\.log$/i, "") + ".log";
};
