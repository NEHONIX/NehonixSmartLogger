# Types de Réponses WebSocket

## Vue d'ensemble

Le serveur WebSocket peut envoyer différents types de réponses au client. Chaque réponse suit un format standard avec un `type` et un `payload`.

## Types de Réponses

### 1. Connexion Initiale

```typescript
{
  type: "connect",
  payload: {
    appId: string | undefined;
    userId: string | undefined;
  }
}
```

### 2. Authentification

#### Succès

```typescript
{
  type: "auth_success",
  payload: {
    appId: string;
    userId: string;
  }
}
```

#### Erreur

```typescript
{
  type: "auth_error",
  payload: {
    message: string;
  }
}
```

### 3. Logs

```typescript
{
  type: "logs",
  payload: LogEntry[]
}

interface LogEntry {
  id: string;
  timestamp: number;
  level: string;
  message: string;
  metadata?: any;
  appId: string;
  userId: string;
}
```

### 4. Métriques

```typescript
{
  type: "metrics",
  payload: PerformanceMetrics
}

interface PerformanceMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    free: number;
    total: number;
  };
  disk: {
    used: number;
    free: number;
    total: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    connections: number;
  };
  activeConnections: number;
  messageRate: number;
  errorRate: number;
}
```

## Exemple d'Utilisation

```typescript
interface WebSocketResponse {
  type: "connect" | "auth_success" | "auth_error" | "logs" | "metrics";
  payload: any;
}

class WebSocketClient {
  private ws: WebSocket;
  private handlers: Map<string, (data: any) => void>;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.handlers = new Map();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.ws.onmessage = (event) => {
      const response: WebSocketResponse = JSON.parse(event.data);
      const handler = this.handlers.get(response.type);
      if (handler) {
        handler(response.payload);
      }
    };
  }

  public onConnect(
    callback: (data: { appId?: string; userId?: string }) => void
  ) {
    this.handlers.set("connect", callback);
  }

  public onAuthSuccess(
    callback: (data: { appId: string; userId: string }) => void
  ) {
    this.handlers.set("auth_success", callback);
  }

  public onAuthError(callback: (data: { message: string }) => void) {
    this.handlers.set("auth_error", callback);
  }

  public onLogs(callback: (logs: LogEntry[]) => void) {
    this.handlers.set("logs", callback);
  }

  public onMetrics(callback: (metrics: PerformanceMetrics) => void) {
    this.handlers.set("metrics", callback);
  }
}

// Exemple d'utilisation
const client = new WebSocketClient("ws://votre-serveur:3001");

client.onConnect((data) => {
  console.log("Connecté avec:", data);
});

client.onAuthSuccess((data) => {
  console.log("Authentifié avec succès:", data);
});

client.onAuthError((data) => {
  console.error("Erreur d'authentification:", data.message);
});

client.onLogs((logs) => {
  console.log("Nouveaux logs reçus:", logs);
});

client.onMetrics((metrics) => {
  console.log("Métriques reçues:", metrics);
});
```

## Notes Importantes

1. Toutes les réponses sont envoyées au format JSON
2. Le champ `type` est toujours présent et indique le type de réponse
3. Le champ `payload` contient les données spécifiques au type de réponse
4. Les réponses d'erreur incluent toujours un message explicatif
5. Les logs sont toujours envoyés dans un tableau, même pour un seul log
6. Les métriques sont envoyées automatiquement toutes les 5 secondes
7. Les réponses sont isolées par application (un client ne reçoit que les logs de son application)
