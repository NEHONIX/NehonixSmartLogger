# Intégration des Métriques de Performance

## Vue d'ensemble

La bibliothèque NehonixSmartLogger collecte maintenant les métriques de performance directement depuis l'application cliente et les envoie au serveur via WebSocket. Ce document décrit les modifications nécessaires côté serveur pour prendre en charge cette nouvelle fonctionnalité.

## Changements Requis

### 1. Gestion des Messages WebSocket

Le serveur recevra maintenant des messages de type "metrics" depuis les clients. Ces messages auront la structure suivante :

```typescript
{
  type: "metrics",
  data: {
    userId: string,
    appId: string,
    metrics: {
      cpu: {
        usage: number,
        system: number,
        user: number
      },
      memory: {
        used: number,
        total: number,
        free: number
      },
      // ... autres métriques de performance
    },
    timestamp: string
  }
}
```

### 2. Stockage des Métriques

Le serveur doit :

1. Stocker ces métriques dans la base de données
2. Les associer à l'application spécifique (appId)
3. Maintenir un historique pour permettre l'analyse sur différentes périodes

### 3. Diffusion des Métriques

Au lieu d'envoyer ses propres métriques, le serveur doit :

1. Écouter les métriques entrantes des applications clientes
2. Les stocker
3. Les rediffuser aux clients connectés qui visualisent les analytics de l'application correspondante

### 4. API de Récupération

Mettre à jour les endpoints d'API pour :

- Récupérer l'historique des métriques
- Filtrer par période (heure, jour, semaine)
- Agréger les données pour des vues d'ensemble

## Exemple d'Implémentation

```typescript
// Dans votre gestionnaire WebSocket
ws.on("message", async (data) => {
  const message = JSON.parse(data);

  if (message.type === "metrics") {
    // 1. Stocker les métriques
    await storeMetrics(message.data);

    // 2. Diffuser aux clients intéressés
    broadcastMetrics(message.data);
  }
});

async function storeMetrics(data) {
  // Stocker dans la base de données
  await db.metrics.create({
    appId: data.appId,
    userId: data.userId,
    metrics: data.metrics,
    timestamp: data.timestamp,
  });
}

function broadcastMetrics(data) {
  // Envoyer aux clients qui visualisent les analytics de cette app
  const clients = getClientsViewingApp(data.appId);
  clients.forEach((client) => {
    client.send(
      JSON.stringify({
        type: "metrics",
        payload: {
          metrics: data.metrics,
          timestamp: data.timestamp,
        },
      })
    );
  });
}
```

## Notes Importantes

1. **Performance** : Les métriques peuvent être envoyées fréquemment. Envisagez :

   - La mise en cache
   - L'agrégation des données
   - Le nettoyage périodique des anciennes données

2. **Sécurité** : Assurez-vous que :

   - Seuls les clients authentifiés peuvent envoyer des métriques
   - Les métriques ne sont diffusées qu'aux clients autorisés

3. **Scalabilité** : Pour gérer de nombreuses applications :
   - Utilisez une base de données adaptée aux séries temporelles
   - Implémentez un système de mise en cache efficace
   - Considérez une architecture de microservices pour isoler le traitement des métriques

## Migration

1. Créez les nouveaux schémas de base de données
2. Mettez à jour le serveur WebSocket
3. Déployez les changements
4. Vérifiez que les anciennes versions de la bibliothèque continuent de fonctionner
5. Encouragez les utilisateurs à mettre à jour vers la nouvelle version

## Support

Pour toute question sur l'intégration, contactez l'équipe NehonixSmartLogger :

- Email : support@nehonix.com
- GitHub : https://github.com/NEHONIX/NehonixSmartLogger/issues
