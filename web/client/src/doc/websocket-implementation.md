# Documentation WebSocket NehonixSmartLogger

## 1. Vue d'ensemble

Le système WebSocket de NehonixSmartLogger permet une communication en temps réel entre le serveur et les clients pour la gestion des logs et des métriques. Chaque connexion est sécurisée et liée à une application spécifique.

## 2. Connexion et Authentification

### 2.1 Établissement de la connexion

```typescript
const ws = new WebSocket("ws_url");

ws.onopen = () => {
  console.log("Connexion WebSocket établie");
};
```

### 2.2 Authentification

Après la connexion, vous devez vous authentifier en envoyant un message d'authentification :

```typescript
const authMessage = {
  type: "auth",
  data: {
    userId: "votre-user-id",
    appId: "votre-app-id",
  },
};

ws.send(JSON.stringify(authMessage));
```

#### Réponses possibles :

1. Succès :

```typescript
{
  type: 'auth_success',
  payload: {
    appId: 'votre-app-id',
    userId: 'votre-user-id'
  }
}
```

2. Erreur :

```typescript
{
  type: 'auth_error',
  payload: {
    message: 'Message d\'erreur détaillé'
  }
}
```

## 3. Gestion des Logs

### 3.1 Réception des logs

Les logs sont reçus sous la forme suivante :

```typescript
interface LogEntry {
  id: string;
  timestamp: number;
  level: string;
  message: string;
  metadata?: any;
  appId: string;
  userId: string;
}

// Exemple de message reçu
{
  type: 'logs',
  payload: LogEntry[]
}
```

### 3.2 Filtrage des logs

Vous pouvez définir des filtres pour recevoir uniquement les logs souhaités :

```typescript
const filterMessage = {
  type: "filter",
  filters: {
    level: ["error", "warn"], // Niveaux de log à inclure
    startTime: Date.now() - 3600000, // Depuis 1 heure
    endTime: Date.now(), // Jusqu'à maintenant
  },
};

ws.send(JSON.stringify(filterMessage));
```

### 3.3 Effacement des logs

Pour effacer l'historique des logs en mémoire :

```typescript
const clearMessage = {
  type: "clear",
};

ws.send(JSON.stringify(clearMessage));
```

## 4. Métriques de Performance

### 4.1 Demande de métriques

Pour recevoir les métriques de performance :

```typescript
const metricsMessage = {
  type: "request_metrics",
};

ws.send(JSON.stringify(metricsMessage));
```

### 4.2 Format des métriques reçues

```typescript
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

// Exemple de message reçu
{
  type: 'metrics',
  payload: PerformanceMetrics
}
```

## 5. Gestion de l'Historique

### 5.1 Demande d'historique

Pour recevoir l'historique complet des logs :

```typescript
const historyMessage = {
  type: "request_history",
};

ws.send(JSON.stringify(historyMessage));
```

## 6. Exemple d'Implémentation Complète

```typescript
class LoggerWebSocket {
  private ws: WebSocket;
  private messageHandlers: Map<string, (data: any) => void>;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.messageHandlers = new Map();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.ws.onopen = () => {
      console.log("Connexion WebSocket établie");
    };

    this.ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      const handler = this.messageHandlers.get(response.type);
      if (handler) {
        handler(response.payload);
      }
    };

    this.ws.onerror = (error) => {
      console.error("Erreur WebSocket:", error);
    };

    this.ws.onclose = () => {
      console.log("Connexion WebSocket fermée");
    };
  }

  public authenticate(userId: string, appId: string) {
    const authMessage = {
      type: "auth",
      data: { userId, appId },
    };
    this.ws.send(JSON.stringify(authMessage));
  }

  public setFilters(filters: {
    level?: string[];
    startTime?: number;
    endTime?: number;
  }) {
    const filterMessage = {
      type: "filter",
      filters,
    };
    this.ws.send(JSON.stringify(filterMessage));
  }

  public onLogs(callback: (logs: LogEntry[]) => void) {
    this.messageHandlers.set("logs", callback);
  }

  public onMetrics(callback: (metrics: PerformanceMetrics) => void) {
    this.messageHandlers.set("metrics", callback);
  }

  public requestHistory() {
    const historyMessage = {
      type: "request_history",
    };
    this.ws.send(JSON.stringify(historyMessage));
  }

  public requestMetrics() {
    const metricsMessage = {
      type: "request_metrics",
    };
    this.ws.send(JSON.stringify(metricsMessage));
  }

  public clearLogs() {
    const clearMessage = {
      type: "clear",
    };
    this.ws.send(JSON.stringify(clearMessage));
  }
}

// Exemple d'utilisation
const logger = new LoggerWebSocket("ws://votre-serveur:3001");

logger.authenticate("user123", "app456");

logger.onLogs((logs) => {
  console.log("Nouveaux logs reçus:", logs);
});

logger.onMetrics((metrics) => {
  console.log("Métriques reçues:", metrics);
});

// Demander l'historique
logger.requestHistory();

// Configurer des filtres
logger.setFilters({
  level: ["error", "warn"],
  startTime: Date.now() - 3600000,
});
```

## 7. Bonnes Pratiques

1. **Gestion des reconnexions** :

   - Implémentez une logique de reconnexion automatique
   - Stockez les messages en attente pendant la déconnexion
   - Réauthentifiez automatiquement après une reconnexion

2. **Gestion des erreurs** :

   - Gérez les erreurs de connexion
   - Vérifiez les messages d'erreur d'authentification
   - Implémentez une gestion des timeouts

3. **Performance** :

   - Limitez le nombre de messages envoyés
   - Utilisez le batching pour les logs
   - Gérez la mémoire pour les grands volumes de logs

4. **Sécurité** :
   - Stockez les identifiants de manière sécurisée
   - Validez les données reçues
   - Gérez les sessions de manière appropriée

## 8. Notes Importantes

- Les logs sont isolés par application
- L'historique est limité à 1000 entrées par application
- Les métriques sont envoyées toutes les 5 secondes
- Les connexions inactives sont fermées après un timeout
- Les messages non authentifiés sont rejetés
