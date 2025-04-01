import { NehonixSmartLogger, NSMLogger } from "../../logger";

const text = "Hello World";
const logger = NehonixSmartLogger.from("test_folder").import(
  "nehonix.config.json"
);

//Simple log
logger.log(text);

//Log with level
logger.log("info", text);

//Log with level and message
logger.log("error", text);

//Log with level and message and object
logger.log("warn", { text, number: 1 });

//Log with level and message and array
logger.log("debug", [text, text]);

//Log with level and message and error
logger.log("error", new Error("Error message"));

//Log with level and message and error and object
logger.log("warn", { text, number: 1 }, new Error("Error message"));

//logs with options
NSMLogger(
  {
    logMode: {
      name: "test",
      enable: true,
    },
  },
  text
);

// Fonction pour simuler des logs à intervalles réguliers
const simulateLogging = () => {
  // Log simple
  NSMLogger("Hello World");

  // Log avec niveau et message
  setTimeout(() => {
    NSMLogger("error", "Une erreur critique s'est produite !");
  }, 1000);

  // Log avec objet
  setTimeout(() => {
    NSMLogger("warn", {
      message: "Attention : ressources limitées",
      usage: {
        cpu: "85%",
        memory: "1.2GB",
        disk: "90%",
      },
    });
  }, 2000);

  // Log avec tableau
  setTimeout(() => {
    NSMLogger("info", ["Démarrage", "Service A", "Service B", "Service C"]);
  }, 3000);

  // Log avec erreur
  setTimeout(() => {
    try {
      throw new Error("Erreur inattendue dans le processus");
    } catch (error) {
      NSMLogger("error", error);
    }
  }, 4000);

  // Log complexe avec plusieurs informations
  setTimeout(() => {
    NSMLogger("debug", {
      action: "database_query",
      duration: 1532,
      query: "SELECT * FROM users WHERE active = true",
      params: { active: true },
      results: 150,
    });
  }, 5000);
};

// Démarrer la simulation
simulateLogging();

// Répéter la simulation toutes les 10 secondes
setInterval(simulateLogging, 10000);

// Garder le processus en vie
process.stdin.resume();
