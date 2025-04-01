# Rapport d'Intégration Frontend-Backend

## 1. Vue d'ensemble des composants Frontend

### 1.1 Page Analytics

La page Analytics est le point central pour visualiser les métriques et les logs d'une application en temps réel.

#### Structure

- En-tête avec nom de l'application et statut WebSocket
- Sélecteur de période (dernière heure, 24h, semaine)
- Sections principales :
  - Métriques de performance
  - Analyse des logs
  - Détection d'anomalies

#### États

- `metrics`: Données de performance (CPU, mémoire, disque, réseau)
- `logs`: Liste des logs de l'application
- `timeRange`: Période d'analyse sélectionnée
- `loading`: État de chargement initial
- `isConnected`: État de la connexion WebSocket

### 1.2 Composant MetricsChart

Affiche les graphiques et statistiques de performance.

#### Données attendues

```typescript
interface PerformanceMetrics {
  cpu: {
    usage: number; // Pourcentage d'utilisation CPU
    cores: number; // Nombre de cœurs
  };
  memory: {
    used: number; // Mémoire utilisée en octets
    free: number; // Mémoire libre en octets
  };
  disk: {
    used: number; // Espace disque utilisé en octets
    free: number; // Espace disque libre en octets
  };
  network: {
    bytesReceived: number; // Octets reçus
    bytesSent: number; // Octets envoyés
  };
}
```

## 2. Exigences Backend

### 2.1 API REST

#### Endpoints requis

1. **GET /api/apps/:appId/metrics**

   - Paramètres :
     - `appId`: ID de l'application
     - `timeRange`: "hour" | "day" | "week"
   - Retourne : `PerformanceMetrics`
   - Description : Récupère les métriques historiques

2. **GET /api/apps/:appId/logs**
   - Paramètres :
     - `appId`: ID de l'application
     - `timeRange`: "hour" | "day" | "week"
   - Retourne : `LogEntry[]`
   - Description : Récupère les logs historiques

### 2.2 WebSocket

#### Configuration

- URL : Configurable...
- Authentification : Requise via `userId`

#### Messages attendus

1. **Connexion**

```typescript
{
  type: "connect",
  payload: {
    appId: string;
    userId: string;
  }
}
```

2. **Métriques en temps réel**

```typescript
{
  type: "metrics",
  payload: PerformanceMetrics
}
```

3. **Logs en temps réel**

```typescript
{
  type: "logs",
  payload: LogEntry[]
}
```

#### Filtres

- Support des filtres par `appId`
- Mise à jour des filtres en temps réel

## 3. Flux de données

### 3.1 Chargement initial

1. Connexion WebSocket
2. Récupération des données historiques via API REST
3. Affichage des données initiales

### 3.2 Mises à jour en temps réel

1. Réception des métriques via WebSocket
2. Mise à jour des graphiques et statistiques
3. Réception des nouveaux logs
4. Mise à jour de l'analyse et détection d'anomalies

## 4. Gestion des erreurs

### 4.1 Frontend

- Affichage des états de chargement
- Gestion des valeurs nulles/undefined
- Indicateurs de statut WebSocket
- Messages d'erreur utilisateur

### 4.2 Backend attendu

- Gestion des erreurs de connexion WebSocket
- Validation des données
- Rate limiting pour les API REST
- Gestion des timeouts

## 5. Performance

### 5.1 Frontend

- Optimisation des re-rendus
- Gestion de la mémoire pour les graphiques
- Pagination des logs si nécessaire

### 5.2 Backend attendu

- Mise en cache des données historiques
- Compression des données WebSocket
- Limitation du nombre de connexions WebSocket
- Optimisation des requêtes de base de données

## 6. Sécurité

### 6.1 Frontend

- Authentification requise
- Validation des données reçues
- Protection contre les injections

### 6.2 Backend attendu

- Authentification WebSocket
- Validation des tokens
- Rate limiting par utilisateur
- Sanitization des données

## 7. Tests recommandés

### 7.1 Frontend

- Tests des composants React
- Tests de connexion WebSocket
- Tests de gestion des erreurs
- Tests de performance

### 7.2 Backend

- Tests des endpoints API
- Tests de connexion WebSocket
- Tests de charge
- Tests de sécurité

## 8. Documentation nécessaire

### 8.1 API

- Documentation OpenAPI/Swagger
- Exemples de requêtes/réponses
- Codes d'erreur

### 8.2 WebSocket

- Format des messages
- Gestion des erreurs
- Exemples de flux de données
