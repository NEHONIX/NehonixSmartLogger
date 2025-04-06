import { NehonixSmartLogger } from "../../logger";
import fs from "fs";
import path from "path";

const logger = NehonixSmartLogger.from("./test_app_folder").import(
  "nehonix-config-my super app with config (1).json"
);
// logger.enableRemoteMode();

// Chemin du fichier de log
const logFilePath = path.join(process.cwd(), "logs", "test-log.log");

// Nettoyer le fichier de log s'il existe déjà
if (fs.existsSync(logFilePath)) {
  fs.unlinkSync(logFilePath);
}

console.log("=== Test du chiffrement des logs ===");

// Test 1: Message non chiffré
logger.logWithOptions(
  {
    writeFileMode: {
      enable: true,
      fileName: "test-log",
    },
    typeOrMessage: "info",
  },
  "Message non chiffré"
);

// Test 2: Message chiffré avec une clé fournie par l'utilisateur
const userKey =
  "10d002d5ad4dbea561efc673473755cd70c49f0a88297a6133380f11ce0eaf5a";
logger.logWithOptions(
  {
    writeFileMode: {
      enable: true,
      fileName: "test-log",
      crypt: {
        CRYPT_DATAS: {
          lockStatus: "enable",
          key: userKey,
        },
      },
    },
    typeOrMessage: "info",
  },
  "Message chiffré avec une clé fournie par l'utilisateur"
);

// Test 3: Message chiffré sans clé fournie (clé générée automatiquement)
logger.logWithOptions(
  {
    writeFileMode: {
      enable: true,
      fileName: "test-log",
      crypt: {
        CRYPT_DATAS: {
          lockStatus: "enable",
        },
      },
    },
    typeOrMessage: "info",
  },
  "Message chiffré sans clé fournie (clé générée automatiquement)"
);

// Attendre un peu pour s'assurer que les logs sont écrits
setTimeout(() => {
  console.log("\n=== Test du déchiffrement des logs ===");

  // Lire le contenu du fichier de log
  const logContent = fs.readFileSync(logFilePath, "utf-8");
  console.log("Contenu du fichier de log:");
  console.log(logContent);

  // Test 1: Déchiffrer un message chiffré avec une clé fournie par l'utilisateur
  try {
    const decrypted1 = logger.decryptEncFileLog({
      path: logFilePath,
      key: userKey,
    });
    console.log("\nMessage déchiffré avec la clé utilisateur:");
    console.log(decrypted1);
  } catch (error) {
    console.error(
      "Erreur lors du déchiffrement avec la clé utilisateur:",
      error
    );
  }

  // Test 2: Déchiffrer un message chiffré sans clé fournie
  try {
    const decrypted2 = logger.decryptEncFileLog({
      path: logFilePath,
    });
    console.log(
      "\nMessage déchiffré sans clé (utilisation de la clé incluse):"
    );
    console.log(decrypted2);
  } catch (error) {
    console.error("Erreur lors du déchiffrement sans clé:", error);
  }
}, 1000);
