import WebSocket from "ws";
import { LogEntry } from "../../shared/types/log";

export class LogWebSocketServer {
  private wss: WebSocket.Server;
  private clients: Set<WebSocket> = new Set();

  constructor(options: {
    port: number;
    host: string;
    maxConnections?: number;
    heartbeatInterval?: number;
    reconnectAttempts?: number;
  }) {
    this.wss = new WebSocket.Server({
      port: options.port,
      host: options.host,
      maxPayload: 50 * 1024 * 1024, // 50MB max payload
    });

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("Nouveau client connecté");
      this.clients.add(ws);

      ws.on("message", (data: WebSocket.Data) => {
        try {
          const logEntry = JSON.parse(data.toString()) as LogEntry;
          // Diffuser le log à tous les autres clients
          this.broadcast(logEntry, ws);
        } catch (error) {
          console.error("Erreur lors du parsing des données:", error);
        }
      });

      ws.on("close", () => {
        console.log("Client déconnecté");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("Erreur WebSocket:", error);
      });
    });

    this.wss.on("error", (error) => {
      console.error("Erreur du serveur WebSocket:", error);
    });

    console.log(
      `Serveur WebSocket démarré sur ws://${options.host}:${options.port}`
    );
  }

  private broadcast(data: any, sender?: WebSocket): void {
    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  public close(): void {
    this.wss.close(() => {
      console.log("Serveur WebSocket arrêté");
    });
  }
}

// Créer et exporter l'instance du serveur
export const server = new LogWebSocketServer({
  port: 8087,
  host: "localhost",
  maxConnections: 10,
  heartbeatInterval: 30000,
  reconnectAttempts: 5,
});

// Gestion de l'arrêt propre
process.on("SIGINT", () => {
  console.log("Arrêt du serveur...");
  server.close();
  process.exit(0);
});
