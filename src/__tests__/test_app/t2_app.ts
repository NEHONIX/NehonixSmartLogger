import NSMLogger, { NehonixSmartLogger } from "../../logger";
import { createConfig, LoggerConfig as lgc } from "../../utils/logger.util";
import { testLogger } from "./glob";

// Test du mode local (sans configuration)
console.log("\n=== Test du mode local ===");
testLogger.log("Hello World - test 2");
NSMLogger("info", "Test en mode local avec niveau info");
NSMLogger("debug", "Test en mode local avec niveau debug");
NSMLogger("error", "Test en mode local avec niveau error");
NSMLogger("warn", "Test en mode local avec niveau warn"); 

// Test avec configuration (mode remote)
console.log("\n=== Test du mode distant ===");
// testLogger.log("Hello World - test avec config");

// Test avec différents niveaux de log
// setInterval(() => {
//   // Mode local
//   NSMLogger("info", "Log périodique en mode local");

//   // Mode distant avec configuration
//   testLogger.log("warn", "Log périodique en mode distant", {
//     metadata: { timestamp: new Date().toISOString() },
//   });
// }, 1000);
