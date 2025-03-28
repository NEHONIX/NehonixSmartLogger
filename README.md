# Nehonix Logger

Un gestionnaire de logs puissant et intelligent pour Node.js, avec support pour la coloration syntaxique, le logging dans des fichiers, le chiffrement des logs et l'analyse intelligente des patterns.

## Installation

```bash
npm install nehonix-logger
```

## Fonctionnalités

-  **Coloration syntaxique** des logs dans la console
-  **Logging dans des fichiers** avec rotation automatique
-  **Chiffrement des logs** pour les données sensibles
-  **Analyse intelligente** des patterns d'erreurs
-  **Détection d'anomalies** en temps réel
-  **Suggestions automatiques** de correction
-  **Patterns personnalisables** pour l'analyse

## Utilisation

### Importation

```typescript
import { nehonixLogger } from "nehonix-logger";
```

### Exemples d'utilisation

#### Log simple

```typescript
nehonixLogger("Message simple");
```

#### Log avec niveau

```typescript
nehonixLogger("error", "Une erreur est survenue");
nehonixLogger("warn", "Attention !");
nehonixLogger("info", "Information importante");
nehonixLogger("debug", "Message de debug");
```

#### Log avec configuration

```typescript
nehonixLogger(
  {
    logMode: {
      enable: true,
      name: "mon-app",
      saved_message: "enable",
      display_log: true,
      crypt: {
        CRYPT_DATAS: {
          lockStatus: "enable",
          key: "votre-clé-hexadécimale",
        },
      },
    },
    groupInterval: 5000, // Intervalle en ms entre les marqueurs de groupe
  },
  "Message avec configuration"
);
```

### Analyse Intelligente

#### Patterns d'erreurs prédéfinis

Le logger inclut des patterns prédéfinis pour détecter automatiquement :

- Erreurs réseau (ECONNREFUSED, timeout...)
- Problèmes de mémoire (out of memory, stack overflow...)
- Erreurs de code (undefined, null...)
- Problèmes de performance

#### Ajout de patterns personnalisés

```typescript
nehonixLogger.addAnalysisPattern({
  pattern: /api rate limit exceeded/i,
  severity: "high",
  category: "api",
  suggestion: "Implementez un système de rate limiting côté client",
});
```

#### Réinitialisation de l'analyseur

```typescript
nehonixLogger.resetAnalyzer();
```

### Détection d'anomalies

Le système détecte automatiquement :

- Les erreurs fréquentes (plus de 5 occurrences)
- Les pics d'erreurs (plus de 10 erreurs en 5 minutes)
- Les patterns récurrents

Exemple de sortie d'analyse :

```
 Analyse des logs:
 Erreur fréquente détectée (6x) - network:
   Pattern: ECONNREFUSED
   Sévérité: high
   Suggestion: Vérifiez que le service distant est bien démarré et accessible

 Anomalies détectées:
   - Type: high_frequency
     Fréquence: 12x en 5 minutes
     Catégorie: network
     Sévérité: high
```

## Configuration

### Options disponibles

- `logMode`: Configuration du mode de logging

  - `enable`: Active/désactive le logging dans un fichier
  - `name`: Nom du fichier de log
  - `saved_message`: Affiche les messages de confirmation ('enable' ou 'disable')
  - `display_log`: Affiche les logs dans la console
  - `crypt`: Configuration du chiffrement
    - `CRYPT_DATAS`: Options de chiffrement
      - `lockStatus`: Active/désactive le chiffrement
      - `key`: Clé de chiffrement en format hexadécimal
      - `iv`: Vecteur d'initialisation (optionnel)

- `groupInterval`: Intervalle en millisecondes entre les marqueurs de groupe dans le fichier de log

### Niveaux de log

Les niveaux de log disponibles sont :

- `error`: Erreurs critiques
- `warn`: Avertissements
- `info`: Informations importantes
- `log`: Messages généraux
- `debug`: Messages de débogage

## Licence

MIT
