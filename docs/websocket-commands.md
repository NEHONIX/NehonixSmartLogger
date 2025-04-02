# Commandes WebSocket NehonixSmartLogger

Ce document décrit les nouvelles commandes WebSocket ajoutées pour gérer les actions à distance sur les logs.

## Structure des commandes

Toutes les commandes suivent la structure suivante :

```typescript
{
  type: "command",
  data: {
    userId: string,
    appId: string,
    type: string,    // Type de commande spécifique
    data: any        // Données spécifiques à la commande
  }
}
```

## Commandes disponibles

### 1. Contrôle de l'affichage console

**Type**: `console_toggle`

**Données**:

```typescript
{
  enabled: boolean; // true pour activer, false pour désactiver
}
```

**Exemple**:

```json
{
  "type": "command",
  "data": {
    "userId": "user-123",
    "appId": "app-456",
    "type": "console_toggle",
    "data": {
      "enabled": true
    }
  }
}
```

### 2. Contrôle du chiffrement des logs

**Type**: `encryption_toggle`

**Données**:

```typescript
{
  enabled: boolean,  // true pour activer, false pour désactiver
  key: string       // Clé API pour le chiffrement/déchiffrement
}
```

**Exemple**:

```json
{
  "type": "command",
  "data": {
    "userId": "user-123",
    "appId": "app-456",
    "type": "encryption_toggle",
    "data": {
      "enabled": true,
      "key": "api-key-123"
    }
  }
}
```

## Réponses aux commandes

Le serveur doit répondre à chaque commande avec un message de type `command_response` :

```typescript
{
  type: "command_response",
  payload: {
    success: boolean,
    message: string,
    data?: any
  }
}
```

**Exemple de réponse réussie**:

```json
{
  "type": "command_response",
  "payload": {
    "success": true,
    "message": "Console display enabled",
    "data": {
      "consoleEnabled": true
    }
  }
}
```

**Exemple de réponse d'erreur**:

```json
{
  "type": "command_response",
  "payload": {
    "success": false,
    "message": "Invalid API key"
  }
}
```

## Sécurité

1. Toutes les commandes doivent être authentifiées avec un `userId` et `appId` valides.
2. La clé API utilisée pour le chiffrement doit être validée côté serveur.
3. Les commandes ne doivent être acceptées que si l'utilisateur a les droits nécessaires sur l'application.

## Implémentation côté serveur

1. Ajouter un nouveau gestionnaire de messages pour le type "command"
2. Valider les credentials (userId, appId)
3. Traiter la commande spécifique
4. Envoyer une réponse appropriée

## Exemple d'implémentation (pseudo-code)

```typescript
function handleWebSocketMessage(message: WebSocketMessage) {
  if (message.type === "command") {
    const { userId, appId, type, data } = message.data;

    // Validation des credentials
    if (!validateCredentials(userId, appId)) {
      sendError("Invalid credentials");
      return;
    }

    // Traitement de la commande
    switch (type) {
      case "console_toggle":
        handleConsoleToggle(userId, appId, data.enabled);
        break;
      case "encryption_toggle":
        handleEncryptionToggle(userId, appId, data.enabled, data.key);
        break;
      default:
        sendError("Unknown command type");
    }
  }
}

function sendCommandResponse(success: boolean, message: string, data?: any) {
  const response = {
    type: "command_response",
    payload: {
      success,
      message,
      data,
    },
  };
  ws.send(JSON.stringify(response));
}
```
