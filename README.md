# Nehonix Logger

Un gestionnaire de logs puissant et flexible pour Node.js, avec support pour la coloration syntaxique, le logging dans des fichiers, et le chiffrement des logs.

## Installation

```bash
npm install nehonix-logger
```

## Utilisation

### Importation

```typescript
import nehonixLogger from "nehonix-logger";
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
