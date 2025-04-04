import { NehonixSmartLogger } from "../../logger";

// Initialisation avec configuration
const logger = NehonixSmartLogger.from("./test_app_folder").import(
  "nehonix-config-app with description (4).json"
);

console.log("=== Test du mode local ===");
// Test en mode local (par défaut)
logger.info("Test en mode local avec niveau info");
logger.debug("Test en mode local avec niveau debug");
logger.error("Test en mode local avec niveau error");
logger.warn("Test en mode local avec niveau warn");

// Utilisation de la méthode avancée (rétrocompatibilité)
logger.logWithOptions(
  {
    logMode: {
      enable: true,
      name: "test-log",
    },
    typeOrMessage: "info",
  },
  "Test avec options avancées"
);

console.log("=== Test du mode distant ===");
// Activation du mode remote
logger.enableRemoteMode();

// Les logs suivants seront envoyés au serveur WebSocket
setInterval(() => {
  logger.info("Test en mode distant avec niveau info");
  logger.debug("Test en mode distant avec niveau debug");
  logger.error("Test en mode distant avec niveau error");
  logger.warn("Test en mode distant avec niveau warn");
}, 5000);
export { logger as testLogger };
