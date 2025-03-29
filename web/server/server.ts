import { server as WsServer } from "./core";

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  console.error("Erreur non capturée:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Promesse rejetée non gérée:", reason);
});

// Garder le processus en vie
process.stdin.resume();

WsServer;
// Gestion de l'arrêt propre
process.on("SIGINT", () => {
  console.log("\nArrêt du serveur...");
  process.exit(0);
});

console.log("Serveur WebSocket prêt à recevoir des connexions...");
