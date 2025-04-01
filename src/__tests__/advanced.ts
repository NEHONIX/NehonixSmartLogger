import NSMLogger, { NehonixSmartLogger } from "../logger";

async function testAdvancedLogging() {
  const logger = NehonixSmartLogger.getInstance();

  // Initialisation avec configuration complète
  await logger.initialize({
    persistence: {
      maxSize: 10, // 10MB par fichier pour les tests
      maxFiles: 5,
      compress: true,
      interval: "hourly",
    },
    monitoring: {
      enabled: true,
      samplingRate: 100, // 100% pour les tests
      maxEventsPerSecond: 10,
      monitorMemory: true,
      monitorCPU: true,
      monitorNetwork: true,
    },
  });

  // Configuration des identifiants pour le WebSocket
  logger.setCredentials("test-user", "test-app");

  // Test des différents niveaux de log avec rotation
  const testLogs = async () => {
    // Log simple avec configuration de persistance
    NSMLogger(
      {
        logMode: {
          enable: true,
          name: "test-rotation",
          maxSize: 1, // 1MB pour forcer la rotation
          compress: true,
          rotationInterval: "hourly",
        },
      },
      "Test de rotation des logs"
    );

    // Log avec métriques de performance
    NSMLogger(
      {
        logMode: {
          enable: true,
          name: "test-metrics",
          display_log: true,
        },
      },
      {
        message: "Test des métriques",
        performance: {
          cpu: "85%",
          memory: "1.2GB",
          network: "50Mbps",
        },
      }
    );

    // Log avec chiffrement
    NSMLogger(
      {
        logMode: {
          enable: true,
          name: "test-encryption",
          crypt: {
            CRYPT_DATAS: {
              lockStatus: "enable",
              key: "0123456789abcdef0123456789abcdef", // Clé de test
              iv: Buffer.alloc(16, 0),
            },
          },
        },
      },
      "Message confidentiel à chiffrer"
    );

    // Simulation d'erreurs pour tester l'analyseur
    NSMLogger("error", new Error("Erreur critique de test"));
    NSMLogger("warn", {
      type: "performance_warning",
      message: "Dégradation des performances détectée",
      metrics: {
        responseTime: 5000,
        errorRate: "15%",
      },
    });
  };

  // Exécuter les tests plusieurs fois pour vérifier la rotation
  for (let i = 0; i < 5; i++) {
    console.log(`\n=== Cycle de test ${i + 1} ===\n`);
    await testLogs();
    // Attendre 2 secondes entre chaque cycle
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Test des filtres WebSocket
  logger.setFilters({
    level: ["error", "warn"],
    appId: "test-app",
  });

  // Test de nettoyage des logs
  logger.clearLogs();

  // Attendre un peu avant de terminer
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Arrêt propre des services
  await logger.shutdown();
}

// Exécuter les tests
console.log("Démarrage des tests avancés...\n");
testAdvancedLogging().catch(console.error);

// Garder le processus en vie pour les tests
process.stdin.resume();
