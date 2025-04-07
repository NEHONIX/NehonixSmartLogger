# NehonixSmartLogger

Une bibliothèque de logging intelligente et sécurisée avec interface de suivi en temps réel.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Guide de démarrage rapide](#guide-de-démarrage-rapide)
- [Modes d'importation](#modes-dimportation)
- [Mode d'écriture des logs](#mode-décriture-des-logs)
- [Configuration avancée](#configuration-avancée)
- [Interface Web](#interface-web)
- [Monitoring des performances](#monitoring-des-performances)
- [Sécurité](#sécurité)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Contribution](#contribution)

## Fonctionnalités

- **Logging en temps réel** avec interface web de suivi
- **Chiffrement des logs** pour données sensibles
- **Configuration à distance** des niveaux et comportements de log
- **Métriques de performance** et détection d'anomalies
- **Persistance configurable** des logs
- **Mode hors ligne** avec synchronisation automatique

## Installation

```bash
npm install nehonix-logger
# ou
yarn add nehonix-logger
```

## Guide de démarrage rapide

### 1. Configuration basique

Créez un fichier `nehonix.config.json`:

```json
{
  "app": {
    "provider": "nehonix",
    "apiKey": "votre-clé-api",
    "appId": "votre-app-id",
    "name": "Mon Application"
  },
  "logLevel": "debug",
  "console": {
    "enabled": true,
    "showTimestamp": true,
    "colorized": true
  }
}
```

## Modes d'importation

NehonixSmartLogger offre trois modes d'importation de configuration, chacun adapté à différents cas d'utilisation :

### 1. Mode Local (Recommandé pour le développement)

```typescript
const logger = await NehonixSmartLogger.from("./config").import(
  "nehonix.config.json"
);
```

✅ **Avantages**

- Configuration simple et rapide
- Idéal pour le développement local
- Pas de dépendance réseau

### 2. Mode Web (@web)

```typescript
const logger = await NehonixSmartLogger.from("@_web").import(
  "https://api.example.com/config.json"
);
```

✅ **Avantages**

- Configuration centralisée
- Mise à jour dynamique possible
- Gestion multi-environnements

📚 [Guide complet du mode Web](docs/web_mode.md)

### 3. Mode Hybride (Recommandé pour la production)

```typescript
// Configuration avec fallback
try {
  const logger = await NehonixSmartLogger.from("@_web").import(
    "https://api.example.com/config.json"
  );
} catch (error) {
  console.warn("Fallback to local config:", error);
  const logger = await NehonixSmartLogger.from("./config").import(
    "nehonix.config.json"
  );
}
```

✅ **Avantages**

- Robustesse maximale
- Fallback automatique
- Idéal pour la production

### Notre recommandation

Pour une utilisation optimale de NehonixSmartLogger, nous recommandons :

1. **Développement** : Mode Local

   - Configuration simple via fichier local
   - Itération rapide

2. **Tests/Staging** : Mode Web

   - Configuration centralisée
   - Tests des fonctionnalités distantes

3. **Production** : Mode Hybride
   - Robustesse maximale
   - Fallback automatique
   - Monitoring distant optionnel

```typescript
// Exemple de configuration recommandée pour la production
async function setupProductionLogger() {
  try {
    // Tentative de chargement distant
    const logger = await NehonixSmartLogger.from("@_web").import(
      "https://api.example.com/config.json"
    );

    // Activation optionnelle du mode remote
    if (process.env.ENABLE_REMOTE_MONITORING === "true") {
      logger.enableRemoteMode();
    }

    return logger;
  } catch (error) {
    console.warn("Fallback to local config:", error);
    // Fallback vers configuration locale
    return await NehonixSmartLogger.from("./config").import(
      "nehonix.config.json"
    );
  }
}
```

## Mode d'écriture des logs

NehonixSmartLogger offre un système puissant et flexible pour l'écriture des logs dans des fichiers, avec des fonctionnalités avancées de sécurité et de gestion :

### Caractéristiques principales

- **Chiffrement intégré** : Protégez vos données sensibles avec chiffrement AES-256-CBC
- **Rotation automatique** : Gestion intelligente de l'espace disque
- **Compression des archives** : Optimisation du stockage
- **Formats flexibles** : Support de plusieurs formats de sortie

### Exemple rapide

```typescript
logger.logWithOptions(
  {
    writeFileMode: {
      enable: true,
      fileName: "app.log",
      crypt: {
        CRYPT_DATAS: {
          lockStatus: "enable",
          key: "votre-clé-de-chiffrement", // Optionnel
        },
      },
      log_rotation: {
        maxSize: 100,
        interval: "daily",
      },
    },
    typeOrMessage: "info",
  },
  "Message à enregistrer"
);
```

[![Documentation complète](https://img.shields.io/badge/Documentation-Mode%20d'écriture-blue)](docs/file_logging.md)

> 💡 **[Consultez notre guide détaillé sur le mode d'écriture](docs/file_logging.md)** pour découvrir toutes les fonctionnalités avancées, notamment :
>
> - Configuration complète du chiffrement
> - Gestion de la rotation des logs
> - Bonnes pratiques et exemples

## Modes de fonctionnement

### Mode Local

Le mode local est le mode par défaut après l'initialisation. Dans ce mode :

- Les logs sont affichés dans la console
- L'analyse des logs est effectuée localement
- Les logs peuvent être écrits dans des fichiers locaux
- Aucune connexion au serveur n'est établie

### Mode Remote

Le mode remote est activé soit explicitement via `enableRemoteMode()`, soit automatiquement lors de l'import d'une configuration. Dans ce mode :

- Les logs sont envoyés au serveur Nehonix
- L'affichage console peut être configuré (activé/désactivé)
- Les logs peuvent être chiffrés avant transmission
- L'interface web permet de visualiser les logs en temps réel
- La configuration peut être modifiée à distance

Pour activer/désactiver le mode remote :

```typescript
// Activation du mode remote
logger.enableRemoteMode();

// Désactivation du mode remote
logger.disableRemoteMode();
```

## Configuration avancée

### Structure complète de configuration (peut changer)

```typescript
interface LoggerConfig {
  app: {
    provider: string;
    apiKey: string;
    appId: string;
    name: string;
  };
  logLevel: "error" | "warn" | "info" | "debug" | "trace";
  encryption?: {
    enabled: boolean;
    key?: string;
  };
  console?: {
    enabled: boolean;
    showTimestamp: boolean;
    showLogLevel: boolean;
    colorized: boolean;
    format: "simple" | "detailed";
  };
  persistence?: {
    enabled: boolean;
    maxSize: number;
    rotationInterval: "hourly" | "daily" | "weekly";
    retentionPeriod: number;
    compressArchives: boolean;
  };
  network?: {
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
    timeout: number;
    offlineStorage: boolean;
    maxOfflineSize: number;
  };
  performance?: {
    enabled: boolean;
    samplingRate: number;
    maxEventsPerSecond: number;
    monitorMemory: boolean;
    monitorCPU: boolean;
  };
}
```

### Chiffrement des logs

```typescript
// Configuration du chiffrement
const logger = NehonixSmartLogger.from("./config").import(
  "nehonix.config.json"
);

// Les logs sensibles seront automatiquement chiffrés
logger.log(
  {
    level: "info",
    encryption: true,
  },
  "Données sensibles"
);
```

## Interface Web

L'interface web offre :

- Dashboard en temps réel
- Filtrage et recherche avancée des logs
- Visualisation des métriques de performance
- Configuration à distance des comportements de log
- Système d'alertes et notifications

### Accès à l'interface

1. Créez un compte sur [https://console.nehonix.space](https://console.nehonix.space)
2. Ajoutez votre application
3. Récupérez vos identifiants (apiKey, appId)
4. Configurez votre logger avec ces identifiants

## Monitoring des performances

NehonixSmartLogger intègre un système de monitoring des performances qui collecte et transmet automatiquement des métriques sur l'utilisation des ressources de votre application.

### Configuration du monitoring

Activez le monitoring dans votre configuration :

```json
{
  "performance": {
    "enabled": true,
    "samplingRate": 5000, // Intervalle de collecte en ms
    "maxEventsPerSecond": 10,
    "monitorMemory": true,
    "monitorCPU": true
  }
}
```

### Métriques collectées

Le système collecte les métriques suivantes :

- **CPU** : Utilisation, nombre de cœurs, charge moyenne
- **Mémoire** : Utilisation totale, mémoire libre, pourcentage d'utilisation
- **Processus** : Temps de fonctionnement, utilisation de la mémoire du processus
- **Réseau** : Octets reçus/envoyés, paquets reçus/envoyés par interface
- **Connexions** : Nombre de connexions actives
- **Taux de messages** : Fréquence des logs par niveau
- **Taux d'erreurs** : Fréquence des erreurs

### Flux des métriques

```mermaid
sequenceDiagram
    participant App as Application
    participant Logger as NehonixSmartLogger
    participant WS as WebSocket
    participant Server as Serveur Nehonix
    participant UI as Interface Web

    App->>Logger: Initialisation
    Logger->>Logger: Configuration du monitoring
    loop Collecte périodique
        Logger->>Logger: Collecte des métriques
        Logger->>WS: Envoi des métriques
        WS->>Server: Transmission
        Server->>Server: Stockage
        Server->>UI: Diffusion en temps réel
    end
    UI->>UI: Affichage des graphiques
    UI->>UI: Détection d'anomalies
```

### Visualisation des métriques

Dans l'interface web, les métriques sont présentées sous forme de graphiques interactifs :

- **Graphiques en temps réel** : Visualisation des tendances
- **Vue d'ensemble** : Résumé des performances actuelles
- **Détection d'anomalies** : Identification des comportements inhabituels
- **Analyse des logs** : Corrélation entre les logs et les métriques

### Intégration avec les logs

Le système de monitoring est étroitement intégré avec le système de logging :

- Les pics d'utilisation des ressources sont automatiquement associés aux logs correspondants
- Les anomalies détectées génèrent des logs d'avertissement
- Les tendances de performance sont analysées pour prédire les problèmes potentiels

## Sécurité

### Chiffrement

- Chiffrement AES-256-CBC pour les logs sensibles
- Transmission sécurisée via WebSocket avec double chiffrement
- Gestion sécurisée des clés de chiffrement

### Authentification

- JWT pour l'API REST
- Tokens sécurisés pour les connexions WebSocket
- Rotation automatique des clés

## API Reference

### Méthodes principales

```typescript
// Initialisation
static from(configPath: string): NehonixSmartLogger
static getInstance(): NehonixSmartLogger

// Logging
log(message: string, options?: LogOptions): void
error(message: string, metadata?: any): void
warn(message: string, metadata?: any): void
info(message: string, metadata?: any): void
debug(message: string, metadata?: any): void

// Configuration
updateConfig(config: Partial<LoggerConfig>): void
enableEncryption(key?: string): void
disableEncryption(): void
```

## Architecture

```mermaid
graph TD
    A[Application Client] -->|WS| B[Backend Server]
    A -->|API REST| B
    B -->|WS| C[Interface Web]
    B -->|Base de données| D[(DB)]
```

## Contribution

Les contributions sont les bienvenues ! Consultez notre [guide de contribution](CONTRIBUTING.md) pour plus d'informations.

## Licence

MIT © [Nehonix](https://nehonix.space)
