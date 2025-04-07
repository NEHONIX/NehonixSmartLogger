import { NehonixSmartLogger } from "../../logger";
import { webConfigService } from "../../services/WebConfigService";

// Configuration du service web
const configUrl =
  "https://res.cloudinary.com/nehonix/raw/upload/v1743977073/nehonix-config-my_super_app_with_config_1_c9vlup.json";

const local = "nehonix-config-my super app with config (1).json";

// Test du mode local avec fichier de configuration
console.log("=== Test du mode local ===");
const localLogger = NehonixSmartLogger.from("./test_app_folder");

// Fonction principale asynchrone pour gérer les tests
async function runTests() {
  try {
    // Test en mode local
    await localLogger.import(local);
    localLogger.info("Test en mode local avec niveau info");
    localLogger.debug("Test en mode local avec niveau debug");
    localLogger.error("Test en mode local avec niveau error");
    localLogger.warn("Test en mode local avec niveau warn");

    // Test du mode web sans remote (juste import depuis URL)
    console.log("\n=== Test du mode web sans remote ===");
    console.log("Using super import mode");
    const webLogger = await NehonixSmartLogger.from("@_web").import(configUrl);

    // Ces logs seront affichés localement
    webLogger.info("Test en mode web (local) avec niveau info");
    webLogger.debug("Test en mode web (local) avec niveau debug");
    webLogger.error("Test en mode web (local) avec niveau error");
    webLogger.warn("Test en mode web (local) avec niveau warn");

    // Test du mode web avec remote activé
    console.log("\n=== Test du mode web avec remote ===");
    webLogger.enableRemoteMode(); // Activation explicite du mode remote

    // Ces logs seront envoyés au serveur WebSocket
    webLogger.info("Test en mode web (remote) avec niveau info");
    webLogger.debug("Test en mode web (remote) avec niveau debug");
    webLogger.error("Test en mode web (remote) avec niveau error");
    webLogger.warn("Test en mode web (remote) avec niveau warn");

    // Configuration des intervalles de logs
    setInterval(() => {
      webLogger.info("Log périodique en mode distant");
      webLogger.debug("Debug périodique en mode distant");
    }, 5000);
  } catch (error) {
    console.error("Erreur lors des tests:", error);
  }
}

// Lancement des tests
runTests();

export { webConfigService };
