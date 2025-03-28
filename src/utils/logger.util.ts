import type { SERVER_LOGGER_PROPS } from "../types/type";

/**
 * Configuration par défaut du logger
 */
export const USE_DEFAULT_LOGGER: SERVER_LOGGER_PROPS = {
  groupInterval: 10000,
  logMode: {
    enable: true,
    name: "app.log",
    saved_message: "enable",
    display_log: true,
    crypt: {
      CRYPT_DATAS: {
        lockStatus: "disable",
        iv: Buffer.alloc(16, 0),
      },
      CRYPT_LOGS: {
        isLocked: false,
        iv: Buffer.alloc(16, 0),
      },
    },
  },
};

/**
 * Fonction utilitaire pour créer une configuration de logger personnalisée
 * @param config - Configuration partielle du logger
 * @returns Configuration complète du logger
 */
export const createLoggerConfig = (
  config?: Partial<SERVER_LOGGER_PROPS>
): SERVER_LOGGER_PROPS => {
  return {
    groupInterval: config?.groupInterval || USE_DEFAULT_LOGGER.groupInterval,
    logMode: {
      enable: config?.logMode?.enable ?? USE_DEFAULT_LOGGER.logMode?.enable,
      name: config?.logMode?.name || USE_DEFAULT_LOGGER.logMode?.name,
      saved_message:
        config?.logMode?.saved_message ||
        USE_DEFAULT_LOGGER.logMode?.saved_message,
      display_log:
        config?.logMode?.display_log ??
        USE_DEFAULT_LOGGER.logMode?.display_log,
      crypt: {
        CRYPT_DATAS: {
          lockStatus:
            config?.logMode?.crypt?.CRYPT_DATAS?.lockStatus || "disable",
          key: config?.logMode?.crypt?.CRYPT_DATAS?.key,
          iv: config?.logMode?.crypt?.CRYPT_DATAS?.iv || Buffer.alloc(16, 0),
        },
        CRYPT_LOGS: {
          isLocked: config?.logMode?.crypt?.CRYPT_LOGS?.isLocked || false,
          key: config?.logMode?.crypt?.CRYPT_LOGS?.key,
          iv: config?.logMode?.crypt?.CRYPT_LOGS?.iv || Buffer.alloc(16, 0),
        },
      },
    },
  };
};

/**
 * Fonction utilitaire pour configurer le nom du fichier de log
 * @param name - Nom du fichier de log
 * @returns Nom du fichier de log formaté
 */
export const formatLogFileName = (name: string): string => {
  return name.replace(/\.log$/i, "") + ".log";
};
