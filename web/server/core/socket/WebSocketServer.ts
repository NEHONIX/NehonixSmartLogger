import WebSocket, { WebSocketServer as WSServer } from "ws";
import { EventEmitter } from "events";
import {
  WebSocketServerConfig,
  defaultConfig,
  LogStreamOptions,
  defaultStreamOptions,
} from "./config";

export class LogWebSocketServer extends EventEmitter {
  private server: WSServer | null = null;
  private clients: Set<WebSocket>;
  private logBuffer: any[];
  private flushTimeout: NodeJS.Timeout | null;
  private config: WebSocketServerConfig;
  private streamOptions: LogStreamOptions;

  constructor(
    config: Partial<WebSocketServerConfig> = {},
    streamOptions: Partial<LogStreamOptions> = {}
  ) {
    super();
    this.config = { ...defaultConfig, ...config };
    this.streamOptions = { ...defaultStreamOptions, ...streamOptions };
    this.clients = new Set();
    this.logBuffer = [];
    this.flushTimeout = null;
    this.initializeServer();
  }

  private initializeServer(): void {
    this.server = new WSServer({
      port: this.config.port,
      host: this.config.host,
    });

    this.server.on("connection", this.handleConnection.bind(this));
    this.server.on("error", this.handleError.bind(this));

    console.log(
      `Serveur WebSocket démarré sur ws://${this.config.host}:${this.config.port}`
    );
  }

  private handleConnection(ws: WebSocket): void {
    if (this.clients.size >= this.config.maxConnections) {
      ws.close(1013, "Nombre maximum de connexions atteint");
      return;
    }

    this.clients.add(ws);
    console.log(
      `Nouveau client connecté (${this.clients.size} clients actifs)`
    );

    // Envoyer l'historique des logs au nouveau client
    if (this.logBuffer.length > 0) {
      ws.send(
        JSON.stringify({
          type: "history",
          data: this.logBuffer,
        })
      );
    }

    ws.on("message", this.handleMessage.bind(this, ws));
    ws.on("close", () => this.handleDisconnection(ws));
    ws.on("error", this.handleError.bind(this));

    // Configurer le heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, this.config.heartbeatInterval);

    ws.on("close", () => clearInterval(heartbeat));
  }

  private handleMessage(ws: WebSocket, message: string): void {
    try {
      const data = JSON.parse(message.toString());
      switch (data.type) {
        case "filter":
          // Implémenter le filtrage des logs
          this.emit("filter", data.filter);
          break;
        case "clear":
          this.logBuffer = [];
          this.broadcast({ type: "clear" });
          break;
        default:
          console.warn(`Type de message non reconnu: ${data.type}`);
      }
    } catch (error) {
      console.error(" Erreur lors du traitement du message:", error);
    }
  }

  private handleDisconnection(ws: WebSocket): void {
    this.clients.delete(ws);
    console.log(`Client déconnecté (${this.clients.size} clients restants)`);
  }

  private handleError(error: Error): void {
    console.error("Erreur WebSocket:", error);
    this.emit("error", error);
  }

  public broadcast(data: any): void {
    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public pushLog(log: any): void {
    // Ajouter le log au buffer
    this.logBuffer.push(log);

    // Maintenir la taille du buffer
    if (this.logBuffer.length > this.streamOptions.bufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.streamOptions.bufferSize);
    }

    // Planifier l'envoi du batch
    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(
        () => this.flushLogs(),
        this.streamOptions.flushInterval
      );
    }
  }

  private flushLogs(): void {
    if (this.logBuffer.length > 0) {
      const batch = this.logBuffer.slice(-this.streamOptions.batchSize);
      this.broadcast({
        type: "logs",
        data: batch,
      });
    }
    this.flushTimeout = null;
  }

  public stop(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    if (this.server) {
      this.server.close(() => {
        console.log("Serveur WebSocket arrêté");
      });
    }
  }
}
