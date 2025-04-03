# Documentation du Système de Chiffrement des Logs

## Vue d'ensemble

Le système de chiffrement des logs utilise l'algorithme AES-256-CBC pour chiffrer les messages. Pour assurer une transmission sécurisée des logs chiffrés, nous utilisons un système de double chiffrement avec une clé de transmission temporaire.

## Format des Messages WebSocket

Lorsqu'un log chiffré est envoyé, le message WebSocket contient les informations suivantes :

```typescript
{
  type: "logs",
  data: {
    userId: string,
    appId: string,
    logs: [{
      id: string,
      timestamp: string,
      level: string,
      message: string, // Format: "iv:encrypted_message"
      encrypted: boolean
    }],
    encryption: {
      isEncrypted: boolean,
      transmissionKey: string,    // Clé temporaire pour déchiffrer encryptedKey
      encryptedKey: string        // Clé principale chiffrée avec transmissionKey
    }
  }
}
```

## Processus de Déchiffrement

Pour déchiffrer un message, suivez ces étapes :

1. Vérifiez si le message est chiffré :

   ```typescript
   if (message.data.encryption?.isEncrypted && message.data.logs[0].encrypted)
   ```

2. Récupérez la clé principale :

   ```typescript
   const transmissionKey = message.data.encryption.transmissionKey;
   const encryptedKey = message.data.encryption.encryptedKey;

   // Déchiffrez la clé principale
   const [keyIv, keyEncrypted] = encryptedKey.split(":");
   const mainKey = decrypt(keyEncrypted, keyIv, transmissionKey);
   ```

3. Déchiffrez le message :
   ```typescript
   const [messageIv, encryptedMessage] = log.message.split(":");
   const decryptedMessage = decrypt(encryptedMessage, messageIv, mainKey);
   ```

## Implémentation du Déchiffrement

Voici un exemple d'implémentation en Node.js :

```typescript
import crypto from "crypto";

function decrypt(encryptedData: string, iv: string, key: string): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Exemple d'utilisation dans un gestionnaire WebSocket
wsServer.on("message", (data) => {
  const message = JSON.parse(data);

  if (message.data.encryption?.isEncrypted) {
    const transmissionKey = message.data.encryption.transmissionKey;
    const [keyIv, keyEncrypted] =
      message.data.encryption.encryptedKey.split(":");

    // Déchiffrer la clé principale
    const mainKey = decrypt(keyEncrypted, keyIv, transmissionKey);

    // Déchiffrer chaque message
    message.data.logs.forEach((log) => {
      if (log.encrypted) {
        const [messageIv, encryptedMessage] = log.message.split(":");
        log.message = decrypt(encryptedMessage, messageIv, mainKey);
        log.encrypted = false;
      }
    });
  }

  // Traiter les logs déchiffrés...
});
```

## Notes de Sécurité

1. La clé de transmission est unique pour chaque message WebSocket
2. La clé principale n'est jamais transmise en clair
3. Chaque message utilise un IV unique
4. Les clés doivent être stockées de manière sécurisée côté serveur
5. Utilisez HTTPS/WSS pour la transmission des données

## Considérations pour la Production

- Implémentez une rotation régulière des clés
- Surveillez les tentatives de déchiffrement échouées
- Mettez en place une validation des messages déchiffrés
- Considérez l'utilisation d'un HSM pour la gestion des clés
- Gardez une trace des versions de chiffrement utilisées
