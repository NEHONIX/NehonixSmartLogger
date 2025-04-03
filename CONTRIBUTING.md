# Guide de Contribution

Merci de votre intérêt pour contribuer à NehonixSmartLogger ! Ce document fournit les lignes directrices pour contribuer au projet.

## Table des matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Style de Code](#style-de-code)
- [Processus de Développement](#processus-de-développement)
- [Rapporter des Bugs](#rapporter-des-bugs)
- [Proposer des Améliorations](#proposer-des-améliorations)

## Code de Conduite

Ce projet adhère au [Code de Conduite Contributor Covenant](https://www.contributor-covenant.org/fr/version/2/0/code_of_conduct/). En participant, vous devez respecter ce code.

## Comment Contribuer

1. **Fork** le projet
2. **Clonez** votre fork
   ```bash
   git clone https://github.com/NEHONIX/NehonixSmartLogger.git
   ```
3. **Créez** une branche pour votre fonctionnalité
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```
4. **Committez** vos changements
   ```bash
   git commit -m "feat: description de la fonctionnalité"
   ```
5. **Poussez** vers votre fork
   ```bash
   git push origin feature/ma-nouvelle-fonctionnalite
   ```
6. Ouvrez une **Pull Request**

## Style de Code

### Conventions de Nommage

- **Classes**: PascalCase (ex: `NehonixSmartLogger`)
- **Méthodes/Variables**: camelCase (ex: `logMessage`)
- **Constantes**: SNAKE_CASE (ex: `MAX_LOG_SIZE`)
- **Interfaces**: PascalCase avec préfixe I (ex: `ILoggerConfig`)
- **Types**: PascalCase (ex: `LogLevel`)

### Format du Code

```typescript
// Imports groupés et triés
import { ... } from 'external-lib';
import { ... } from '../internal';

// Documentation des classes
/**
 * Description de la classe
 */
export class MyClass {
  // Propriétés privées en haut
  private myProperty: string;

  // Constructor après les propriétés
  constructor() {
    // ...
  }

  // Méthodes publiques ensuite
  public myMethod(): void {
    // ...
  }

  // Méthodes privées à la fin
  private myPrivateMethod(): void {
    // ...
  }
}
```

### Tests

- Tous les nouveaux composants doivent avoir des tests
- Maintenir une couverture de tests > 80%
- Utiliser des noms descriptifs pour les tests

```typescript
describe("NehonixSmartLogger", () => {
  it("devrait chiffrer les logs quand le chiffrement est activé", () => {
    // ...
  });
});
```

## Processus de Développement

1. **Branches**

   - `master`: version stable
   - `develop`: développement principal
   - `feature/*`: nouvelles fonctionnalités
   - `fix/*`: corrections de bugs
   - `docs/*`: documentation

2. **Commits**
   Suivre la convention [Conventional Commits](https://www.conventionalcommits.org/):

   - `feat:` nouvelle fonctionnalité
   - `fix:` correction de bug
   - `docs:` documentation
   - `style:` formatage
   - `refactor:` refactoring
   - `test:` ajout/modification de tests
   - `chore:` maintenance

3. **Pull Requests**
   - Titre clair et descriptif
   - Description détaillée des changements
   - Référence aux issues concernées
   - Tests passants
   - Code review requise

## Rapporter des Bugs

Utilisez le [bug tracker](https://github.com/NEHONIX/NehonixSmartLogger/issues) avec le template suivant :

```markdown
**Description du Bug**
Description claire et concise.

**Pour Reproduire**

1. Étape 1
2. Étape 2
3. ...

**Comportement Attendu**
Description du comportement attendu.

**Captures d'écran**
Si applicable.

**Environnement**

- OS: [ex: Windows 10]
- Node: [ex: 14.17.0]
- Version: [ex: 1.0.0]
```

## Proposer des Améliorations

Pour proposer une amélioration :

1. Vérifiez qu'elle n'existe pas déjà dans les issues
2. Ouvrez une nouvelle issue avec le label "enhancement"
3. Décrivez clairement :
   - Le problème actuel
   - La solution proposée
   - Les bénéfices attendus
   - Les alternatives considérées

---

Pour toute question, contactez-nous à [support@nehonix.space](mailto:contact@nehonix.space) ou visitez [nehonix.space](https://nehonix.space)
