import fs from "fs";
import path from "path";
import { NSMLogger } from "../logger";

// Mock de fs pour éviter l'écriture réelle de fichiers
jest.mock("fs");

describe("NSMLogger", () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    // Réinitialiser process.env.LOG_LEVEL
    process.env.LOG_LEVEL = "debug";
  });

  describe("Niveaux de log", () => {
    it("devrait logger un message simple", () => {
      const consoleSpy = jest.spyOn(console, "log");
      NSMLogger("Test message");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("devrait logger avec différents niveaux", () => {
      const consoleSpy = {
        error: jest.spyOn(console, "error"),
        warn: jest.spyOn(console, "warn"),
        info: jest.spyOn(console, "info"),
        debug: jest.spyOn(console, "debug"),
        log: jest.spyOn(console, "log"),
      };

      NSMLogger("error", "Error message");
      NSMLogger("warn", "Warning message");
      NSMLogger("info", "Info message");
      NSMLogger("debug", "Debug message");
      NSMLogger("log", "Log message");

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.debug).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalled();

      Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
    });
  });

  describe("Configuration", () => {
    it("devrait respecter la configuration du mode de log", () => {
      const consoleSpy = jest.spyOn(console, "log");
      const config = {
        logMode: {
          enable: true,
          name: "test-log",
          display_log: false,
        },
      };

      NSMLogger(config, "Message avec configuration");
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("devrait créer un fichier de log avec la configuration appropriée", () => {
      const config = {
        logMode: {
          enable: true,
          name: "test-log",
          saved_message: "enable",
        },
      };

      NSMLogger(config, "Message de test");

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining("logs"),
        { recursive: true }
      );

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("test-log.log"),
        expect.any(String)
      );
    });
  });

  describe("Chiffrement", () => {
    it("devrait créer un fichier chiffré quand le chiffrement est activé", () => {
      const config = {
        logMode: {
          enable: true,
          name: "encrypted-log",
          crypt: {
            CRYPT_DATAS: {
              lockStatus: "enable",
              key: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            },
          },
        },
      };

      NSMLogger(config, "Message chiffré");

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining("encrypted-log.log.enc"),
        expect.any(String)
      );
    });
  });

  describe("Groupes de logs", () => {
    it("devrait ajouter un marqueur de groupe après l'intervalle spécifié", () => {
      const config = {
        logMode: {
          enable: true,
          name: "group-log",
        },
        groupInterval: 0, // Pour forcer l'ajout d'un marqueur
      };

      NSMLogger(config, "Premier message");
      NSMLogger(config, "Deuxième message");

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining("group-log.log"),
        expect.stringContaining("NEW LOG GROUP")
      );
    });
  });

  describe("Gestion des erreurs", () => {
    it("devrait gérer les erreurs lors de l'écriture dans le fichier", () => {
      const consoleErrorSpy = jest.spyOn(console, "error");
      const config = {
        logMode: {
          enable: true,
          name: "error-log",
        },
      };

      // Simuler une erreur d'écriture
      (fs.appendFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Erreur d'écriture");
      });

      NSMLogger(config, "Message qui devrait échouer");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error while writing to log file")
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
