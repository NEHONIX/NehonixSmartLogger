# Guide d'utilisation du mode Web dans NehonixSmartLogger

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Licence](https://img.shields.io/badge/license-MIT-green.svg)
[![Documentation](https://img.shields.io/badge/documentation-complète-brightgreen.svg)](../README.md)

</div>

> Un système flexible pour charger des configurations à distance et gérer vos logs de manière centralisée

## Table des matières

- [Introduction](#introduction)
- [Concepts clés](#concepts-clés)
- [Modes de fonctionnement](#modes-de-fonctionnement)
- [Configuration et utilisation](#configuration-et-utilisation)
- [Exemples pratiques](#exemples-pratiques)
- [Bonnes pratiques](#bonnes-pratiques)
- [Dépannage](#dépannage)

## Introduction

Le mode Web de NehonixSmartLogger offre deux fonctionnalités principales distinctes :

1. **Chargement de configuration à distance** : Permet de charger une configuration depuis une URL
2. **Mode Remote** : Permet d'envoyer les logs à un serveur central via le server nehonix.

Ces deux fonctionnalités sont indépendantes et peuvent être utilisées séparément.

## Concepts clés

### Diagramme des modes de fonctionnement

```mermaid
graph TD
    A[NehonixSmartLogger] -->|@web| B{Configuration}
    B -->|Mode Local| C[Logs locaux]
    B -->|enableRemoteMode| D[Logs distants]
    C -->|Console| E[Terminal]
    C -->|Fichier| F[Système de fichiers]
    D -->|WebSocket| G[Serveur Nehonix]
    G -->|Interface Web| H[Dashboard]
```

### Comparaison des modes

| Fonctionnalité         | Mode Local avec @web | Mode Remote  |
| ---------------------- | -------------------- | ------------ |
| Configuration distante | ✅                   | ✅           |
| Logs en console        | ✅                   | Configurable |
| Logs dans fichiers     | ✅                   | ✅           |
| Envoi au serveur       | ❌                   | ✅           |
| Monitoring temps réel  | ❌                   | ✅           |
| Analyse centralisée    | ❌                   | ✅           |

## Modes de fonctionnement

### 1. Mode Local avec configuration web (@web)

```typescript
// Chargement d'une configuration depuis une URL
const logger = await NehonixSmartLogger.from("@_web").import(
  "https://api.example.com/config.json"
);

// Les logs restent locaux
logger.info("Ce message s'affiche uniquement en local");
logger.debug("Debug local avec config distante");
```

### 2. Mode Remote (après enableRemoteMode)

```typescript
// Activation du mode remote après configuration
const logger = await NehonixSmartLogger.from("@_web").import(
  "https://api.example.com/config.json"
);

// Activation du mode remote
logger.enableRemoteMode();

// Les logs sont envoyés au serveur
logger.info("Ce message est envoyé au serveur");
logger.debug("Debug distant avec synchronisation");
```

## Configuration et utilisation

### Structure de la configuration web
(cette configuration est optionnelle)
```typescript
interface WebConfigOptions {
  auth?: {
    type: "bearer" | "basic";
    token?: string;
    username?: string;
    password?: string;
  };
  cache?: {
    enabled: boolean;
    duration: string; // ex: "1h", "1d"
    maxSize?: number;
  };
  security?: {
    validateSSL: boolean;
    validateContent: boolean;
  };
}
```

### Exemple de configuration complète

```typescript
const configOptions = {
  auth: {
    type: "bearer",
    token: "votre-token-ici",
  },
  cache: {
    enabled: true,
    duration: "1h",
    maxSize: 100,
  },
  security: {
    validateSSL: true,
    validateContent: true,
  },
};

const logger = await NehonixSmartLogger.from("@_web").import(
  "https://api.example.com/config.json",
  configOptions
);
```

## Exemples pratiques

### 1. Application avec configuration centralisée

```typescript
// Configuration pour plusieurs environnements
const configUrls = {
  dev: "https://config.example.com/dev.json",
  prod: "https://config.example.com/prod.json",
  staging: "https://config.example.com/staging.json",
};

const env = process.env.NODE_ENV || "dev";
const logger = await NehonixSmartLogger.from("@_web").import(configUrls[env]);

// Utilisation en mode local
logger.info("Configuration chargée pour l'environnement:", env);
```

### 2. Application avec monitoring distant

```typescript
async function setupLogger() {
  // Initialisation avec config web
  const logger = await NehonixSmartLogger.from("@_web").import(
    "https://api.example.com/config.json"
  );

  // Activation du mode remote pour le monitoring
  logger.enableRemoteMode();

  // Configuration des intervalles de logs
  setInterval(() => {
    logger.info("Statut de l'application: OK");
    logger.debug("Métriques:", {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    });
  }, 5000);

  return logger;
}
```

### 3. Basculement dynamique entre modes

```typescript
async function setupDynamicLogger() {
  const logger = await NehonixSmartLogger.from("@_web").import(
    "https://api.example.com/config.json"
  );

  // Fonction de basculement
  function toggleRemoteMode(enable: boolean) {
    if (enable) {
      logger.enableRemoteMode();
      logger.info("Mode remote activé");
    } else {
      logger.disableRemoteMode();
      logger.info("Mode local activé");
    }
  }

  // Exemple de basculement basé sur la connectivité
  setInterval(() => {
    const isOnline = navigator.onLine;
    toggleRemoteMode(isOnline);
  }, 30000);

  return logger;
}
```

## Bonnes pratiques

1. **Gestion de la configuration**

   - Utilisez des URLs HTTPS pour la sécurité
   - Implémentez un système de cache approprié
   - Prévoyez des configurations de fallback

2. **Mode Remote**

   - Activez le mode remote uniquement quand nécessaire
   - Gérez correctement les déconnexions
   - Utilisez les métriques de performance

3. **Sécurité**

   - Protégez vos URLs de configuration
   - Utilisez l'authentification appropriée
   - Validez le contenu des configurations

4. **Performance**
   - Configurez le cache de manière optimale
   - Évitez les rechargements inutiles
   - Surveillez la consommation réseau

## Dépannage

### Problèmes courants et solutions

1. **La configuration ne se charge pas**

   ```typescript
   // Ajoutez la gestion d'erreur
   try {
     const logger = await NehonixSmartLogger.from("@_web").import(configUrl);
   } catch (error) {
     console.error("Erreur de chargement:", error);
     // Utiliser une configuration de secours
     const logger = await NehonixSmartLogger.from("./config").import(
       "local-fallback.json"
     );
   }
   ```

2. **Problèmes de connexion en mode remote**
   ```typescript
   logger.on("disconnect", () => {
     // Stocker les logs localement en attendant la reconnexion
     logger.disableRemoteMode();
     // Tentative de reconnexion après délai
     setTimeout(() => {
       logger.enableRemoteMode();
     }, 5000);
   });
   ```

### Validation de la configuration

```typescript
// Vérification de la configuration chargée
const logger = await NehonixSmartLogger.from("@_web").import(configUrl);

if (!logger.config?.app?.apiKey) {
  throw new Error("Configuration invalide: apiKey manquante");
}
```
