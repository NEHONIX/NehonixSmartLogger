/**
 *                        Begin of logger's project types
 * @namespace NSMLogger
 * @tutorial [NehonixSmartLogger](https://NSMLogger.nehonix.space/docs/NSMLogger)
 * @see [NehonixSmartLogger](https://github.com/NEHONIX/NehonixSmartLogger)
 * @abstract Un gestionnaire de logs puissant et intelligent pour Node.js,
 *  avec support pour la coloration syntaxique, le logging dans des fichiers,
 * le chiffrement des logs et l'analyse intelligente des patterns.
 * ************************************************************************
 * ************************************************************************
 * ****************************** NEHONIX *********************************
 * ************************************************************************
 * ************************************************************************
 */

/**
 * Représente une application dans le système de logging
 * @interface App
 * @description Cette interface définit la structure d'une application dans le système.
 * Elle contient toutes les informations nécessaires pour identifier, gérer et suivre
 * une application qui utilise le service de logging.
 *
 * @property {string} id - Identifiant unique de l'application (format: "app-{uuid}")
 * @property {string} name - Nom convivial de l'application pour l'affichage
 * @property {string} apiKey - Clé d'authentification pour sécuriser les accès
 * @property {string} createdAt - Date de création au format ISO 8601
 * @property {string} userId - Référence vers le propriétaire de l'application
 * @property {"active" | "inactive"} status - État actuel de l'application
 *
 * @remarks
 * L'application est l'entité principale du système. Elle sert de conteneur pour
 * tous les logs et configurations associés. Le status "inactive" permet de
 * désactiver temporairement la collecte des logs sans supprimer l'application.
 *
 * @example
 * ```typescript
 * const myApp: App = {
 *   id: "app-550e8400-e29b-41d4-a716-446655440000",
 *   name: "Mon Application Production",
 *   apiKey: "key-a716446655440000",
 *   createdAt: "2024-03-20T10:00:00Z",
 *   userId: "user-41d4a716446655440000",
 *   status: "active",
 *   description: "Application principale de production"
 * };
 * ```
 *
 * @see {@link CreateAppConfig} pour la configuration initiale
 * @see {@link AppConfig} pour la configuration complète
 */

/**
 * Configuration de l'affichage des logs dans la console
 * @interface ConsoleConfig
 * @description Définit comment les logs doivent être formatés et affichés dans
 * la console. Cette configuration permet de personnaliser la présentation des
 * logs pour une meilleure lisibilité et débogage.
 *
 * @property {boolean} enabled - Active/désactive l'affichage console
 * @property {boolean} showTimestamp - Ajoute l'horodatage aux logs
 * @property {boolean} showLogLevel - Affiche le niveau de criticité
 * @property {boolean} colorized - Active la coloration syntaxique
 * @property {"simple" | "detailed" | "json"} format - Format d'affichage
 *
 * @remarks
 * Le format "simple" affiche uniquement le message
 * Le format "detailed" inclut toutes les métadonnées disponibles
 * Le format "json" est utile pour l'intégration avec d'autres outils
 *
 * @example
 * Format simple:
 * ```
 * Message du log
 * ```
 *
 * Format detailed:
 * ```
 * [2024-03-20 10:00:00] [INFO] [AppName] Message du log
 * ```
 *
 * Format JSON:
 * ```json
 * {
 *   "timestamp": "2024-03-20T10:00:00Z",
 *   "level": "info",
 *   "app": "AppName",
 *   "message": "Message du log"
 * }
 * ```
 *
 * @see {@link LogLevel} pour les niveaux de log disponibles
 */

/**
 * Configuration du stockage persistant des logs
 * @interface PersistenceConfig
 * @description Définit comment les logs doivent être stockés sur le disque.
 * Cette configuration permet de gérer la rotation des fichiers, leur taille
 * et leur durée de conservation.
 *
 * @property {boolean} enabled - Active/désactive le stockage persistant
 * @property {number} maxSize - Taille maximale d'un fichier de log en MB
 * @property {"hourly" | "daily" | "weekly"} rotationInterval - Fréquence de rotation
 * @property {number} retentionPeriod - Durée de conservation en jours
 * @property {boolean} compressArchives - Compression des anciens logs
 *
 * @remarks
 * La rotation des logs est importante pour :
 * - Éviter des fichiers trop volumineux
 * - Faciliter l'archivage et la sauvegarde
 * - Permettre une meilleure organisation des logs
 *
 * Les fichiers sont nommés selon le format : `app-{id}-{date}.log`
 *
 * @example
 * Configuration pour une application de production :
 * ```typescript
 * const prodConfig: PersistenceConfig = {
 *   enabled: true,
 *   maxSize: 100, // 100 MB maximum
 *   rotationInterval: "daily",
 *   retentionPeriod: 90, // Conservation 90 jours
 *   compressArchives: true // Archives en .zip
 * };
 * ```
 *
 * @throws {Error} Si maxSize dépasse 1000 MB
 * @throws {Error} Si retentionPeriod dépasse 365 jours
 *
 * @see {@link NetworkConfig} pour la configuration réseau associée
 */

/**
 * Configuration réseau pour la transmission des logs
 * @interface NetworkConfig
 * @description Définit les paramètres de communication réseau et la gestion
 * des erreurs lors de l'envoi des logs au serveur.
 *
 * @property {number} batchSize - Nombre de logs envoyés par lot (1-1000)
 * @property {number} retryAttempts - Nombre de tentatives en cas d'échec (0-10)
 * @property {number} retryDelay - Délai entre les tentatives en millisecondes
 * @property {number} timeout - Délai maximum d'attente pour une requête
 * @property {boolean} offlineStorage - Active le stockage temporaire hors ligne
 * @property {number} maxOfflineSize - Taille maximale du stockage hors ligne en MB
 *
 * @remarks
 * Le système de batch et de retry permet d'optimiser :
 * - La consommation réseau en groupant les logs
 * - La fiabilité en cas de problème réseau temporaire
 * - La gestion de la mémoire avec le stockage hors ligne
 *
 * @example
 * ```typescript
 * const networkConfig: NetworkConfig = {
 *   batchSize: 50,
 *   retryAttempts: 3,
 *   retryDelay: 1000, // 1 seconde
 *   timeout: 5000, // 5 secondes
 *   offlineStorage: true,
 *   maxOfflineSize: 50 // 50 MB maximum
 * };
 * ```
 *
 * @throws {Error} Si batchSize est hors limites (1-1000)
 * @throws {Error} Si retryAttempts est hors limites (0-10)
 * @throws {Error} Si retryDelay est inférieur à 100ms
 *
 * @see {@link PersistenceConfig} pour le stockage permanent des logs
 */

/**
 * Configuration du monitoring des performances
 * @interface PerformanceConfig
 * @description Définit les paramètres de surveillance des performances
 * de l'application et la collecte des métriques.
 *
 * @property {boolean} enabled - Active/désactive le monitoring
 * @property {number} samplingRate - Taux d'échantillonnage en pourcentage (0-100)
 * @property {number} maxEventsPerSecond - Limite d'événements par seconde
 * @property {boolean} monitorMemory - Active le suivi de la mémoire
 * @property {boolean} monitorCPU - Active le suivi du CPU
 *
 * @remarks
 * Le monitoring permet de :
 * - Détecter les problèmes de performance
 * - Optimiser l'utilisation des ressources
 * - Établir des seuils d'alerte
 *
 * Les métriques sont collectées selon le samplingRate pour minimiser l'impact
 * sur les performances de l'application.
 *
 * @example
 * ```typescript
 * const perfConfig: PerformanceConfig = {
 *   enabled: true,
 *   samplingRate: 10, // Échantillonnage de 10%
 *   maxEventsPerSecond: 100,
 *   monitorMemory: true,
 *   monitorCPU: true
 * };
 * ```
 *
 * @throws {Error} Si samplingRate est hors limites (0-100)
 * @throws {Error} Si maxEventsPerSecond est inférieur à 1
 *
 * @see {@link NetworkConfig} pour la configuration de l'envoi des métriques
 */

/**
 * Configuration du chiffrement des logs
 * @interface Encryption
 * @description Définit les paramètres de sécurisation des logs
 * via le chiffrement des données.
 *
 * @property {boolean} enabled - Active/désactive le chiffrement
 * @property {string} [key] - Clé de chiffrement personnalisée
 *
 * @remarks
 * Le chiffrement assure :
 * - La confidentialité des logs sensibles
 * - La conformité aux normes de sécurité
 * - La protection des données en transit et au repos
 *
 * Si aucune clé n'est fournie, une clé sécurisée est générée automatiquement.
 *
 * @example
 * ```typescript
 * const encryptionConfig: Encryption = {
 *   enabled: true,
 *   key: "clé-personnalisée-très-sécurisée"
 * };
 * ```
 *
 * @throws {Error} Si la clé fournie ne respecte pas les critères de sécurité
 *
 * @see {@link ConsoleConfig} pour la visualisation des logs chiffrés
 */

/**
 * Niveaux de log disponibles
 * @type {LogLevel}
 * @description Définit la hiérarchie des niveaux de criticité des logs,
 * du plus critique (error) au plus détaillé (debug).
 *
 * @remarks
 * Les niveaux permettent de :
 * - Filtrer les logs selon le contexte
 * - Adapter le niveau de détail selon l'environnement
 * - Gérer efficacement le stockage et la performance
 *
 * Hiérarchie des niveaux :
 * - error : Erreurs critiques nécessitant une intervention
 * - warn : Avertissements sur des situations anormales
 * - info : Informations générales sur le fonctionnement
 * - debug : Détails techniques pour le développement
 *
 * @example
 * ```typescript
 * const productionLevel: LogLevel = "warn"; // Uniquement erreurs et warnings
 * const developmentLevel: LogLevel = "debug"; // Tous les logs
 * ```
 *
 * @see {@link ConsoleConfig} pour la configuration de l'affichage des niveaux
 */

/**
 * Nous permet de gérer les apps de l'user
 * @typedef {Object} App
 * @description Représente une application dans le système
 * @property {string} id - Identifiant unique de l'application
 * @property {string} name - Nom de l'application
 * @property {string} apiKey - Clé API pour l'authentification
 * @property {string} createdAt - Date de création de l'application
 * @property {string} userId - ID de l'utilisateur propriétaire
 * @property {string} status - État actuel de l'application
 */

export interface App {
  /** Identifiant unique de l'application */
  id: string;
  /** Nom de l'application */
  name: string;
  /** Clé API pour l'authentification */
  apiKey: string;
  /** Date de création de l'application */
  createdAt: string;
  /** ID de l'utilisateur propriétaire */
  userId: string;
  /** État actuel de l'application */
  status: "active" | "inactive";
  /** Dernière activité enregistrée */
  lastActivity?: string;
  /** Description optionnelle de l'application */
  description?: string;

  /** Configuration de l'application */
  config: AppConfig;
}

/**
 * Configuration complète d'une application
 * @interface AppConfig
 * @description Configuration complète d'une application incluant tous les paramètres
 * nécessaires pour le fonctionnement du système de logging.
 *
 * @property {string} apiKey - Clé d'authentification pour l'API
 * @property {string} appId - Identifiant unique de l'application
 * @property {string} wsUrl - URL du WebSocket pour la communication en temps réel
 * @property {LogLevel} logLevel - Niveau de log global
 * @property {Encryption} [encryption] - Configuration du chiffrement
 * @property {ConsoleConfig} [console] - Configuration de l'affichage console
 * @property {PersistenceConfig} [persistence] - Configuration du stockage
 * @property {NetworkConfig} [network] - Configuration réseau
 * @property {PerformanceConfig} [performance] - Configuration du monitoring
 *
 * @remarks
 * Cette interface étend CreateAppConfig avec les informations nécessaires
 * pour la communication avec le serveur (apiKey, appId, wsUrl).
 *
 * @example
 * ```typescript
 * const config: AppConfig = {
 *   apiKey: "key-123",
 *   appId: "app-456",
 *   wsUrl: "wss://api.example.com/logs",
 *   logLevel: "info",
 *   encryption: { enabled: true },
 *   console: { enabled: true },
 *   persistence: { enabled: true }
 * };
 * ```
 *
 * @see {@link CreateAppConfig} pour la configuration initiale
 * @see {@link App} pour la structure de l'application
 */
export interface AppConfig {
  /** Clé d'authentification pour l'API */
  apiKey: string;
  /** Identifiant unique de l'application */
  appId: string;
  /** URL du WebSocket pour la communication en temps réel */
  wsUrl: string;
  /** Niveau de log global */
  logLevel: LogLevel;
  /** Configuration du chiffrement */
  encryption?: Encryption;
  /** Configuration de l'affichage console */
  console?: ConsoleConfig;
  /** Configuration du stockage persistant */
  persistence?: PersistenceConfig;
  /** Configuration réseau */
  network?: NetworkConfig;
  /** Configuration du monitoring des performances */
  performance?: PerformanceConfig;
}

/**
 * Configuration pour la création d'une nouvelle application
 * @interface CreateAppConfig
 * @description Configuration minimale requise pour créer une nouvelle application.
 *
 * @property {LogLevel} logLevel - Niveau de log global
 * @property {Encryption} encryption - Configuration du chiffrement
 * @property {ConsoleConfig} [console] - Configuration de l'affichage console
 * @property {PersistenceConfig} [persistence] - Configuration du stockage
 * @property {NetworkConfig} [network] - Configuration réseau
 * @property {PerformanceConfig} [performance] - Configuration du monitoring
 *
 * @remarks
 * Cette interface définit les paramètres obligatoires et optionnels
 * pour initialiser une nouvelle application. Seuls logLevel et encryption
 * sont requis, les autres configurations sont optionnelles.
 *
 * @example
 * ```typescript
 * const newAppConfig: CreateAppConfig = {
 *   logLevel: "info",
 *   encryption: { enabled: true },
 *   console: { enabled: true }
 * };
 * ```
 *
 * @see {@link AppConfig} pour la configuration complète
 */

/**
 * Requête pour créer une nouvelle application
 * @interface CreateAppRequest
 * @description Données nécessaires pour créer une nouvelle application.
 *
 * @property {string} name - Nom de l'application
 * @property {string} [description] - Description optionnelle
 * @property {CreateAppConfig} [config] - Configuration optionnelle
 *
 * @remarks
 * Cette interface est utilisée lors de l'appel à l'API de création
 * d'application. Si aucune configuration n'est fournie, les valeurs
 * par défaut seront utilisées.
 *
 * @example
 * ```typescript
 * const request: CreateAppRequest = {
 *   name: "Mon Application",
 *   description: "Application de test",
 *   config: {
 *     logLevel: "info",
 *     encryption: { enabled: true }
 *   }
 * };
 * ```
 *
 * @see {@link CreateAppResponse} pour la réponse du serveur
 */

/**
 * Réponse de création d'application
 * @interface CreateAppResponse
 * @description Réponse du serveur après la création d'une application.
 *
 * @property {string} id - Identifiant unique de l'application créée
 * @property {string} name - Nom de l'application
 * @property {string} [description] - Description de l'application
 * @property {CreateAppConfig} config - Configuration de l'application
 * @property {string} createdAt - Date de création
 * @property {string} updatedAt - Date de dernière mise à jour
 *
 * @remarks
 * Cette interface contient toutes les informations de l'application
 * créée, incluant les identifiants générés par le serveur et les
 * timestamps de création et mise à jour.
 *
 * @example
 * ```typescript
 * const response: CreateAppResponse = {
 *   id: "app-123",
 *   name: "Mon Application",
 *   config: {
 *     logLevel: "info",
 *     encryption: { enabled: true }
 *   },
 *   createdAt: "2024-03-20T10:00:00Z",
 *   updatedAt: "2024-03-20T10:00:00Z"
 * };
 * ```
 *
 * @see {@link CreateAppRequest} pour la requête de création
 */

/**
 * Réponse contenant la liste des applications
 * @interface AppListResponse
 * @description Réponse du serveur contenant la liste des applications.
 *
 * @property {App[]} apps - Liste des applications
 *
 * @remarks
 * Cette interface est utilisée pour récupérer la liste complète
 * des applications associées à un utilisateur.
 *
 * @example
 * ```typescript
 * const response: AppListResponse = {
 *   apps: [
 *     {
 *       id: "app-123",
 *       name: "Application 1",
 *       status: "active"
 *     },
 *     {
 *       id: "app-456",
 *       name: "Application 2",
 *       status: "inactive"
 *     }
 *   ]
 * };
 * ```
 *
 * @see {@link App} pour la structure d'une application
 */

/**
 * Niveaux de log disponibles
 * @type {LogLevel}
 * @description Définit la hiérarchie des niveaux de criticité des logs,
 * du plus critique (error) au plus détaillé (debug).
 *
 * @property {string} error - Erreurs critiques nécessitant une intervention immédiate
 * @property {string} warn - Avertissements sur des situations anormales mais non critiques
 * @property {string} info - Informations générales sur le fonctionnement normal
 * @property {string} debug - Détails techniques pour le développement et le débogage
 *
 * @remarks
 * La sélection d'un niveau active également tous les niveaux plus critiques.
 * Par exemple, choisir "info" capture également "warn" et "error".
 *
 * @example
 * ```typescript
 * // Configuration pour l'environnement de production
 * const productionConfig: CreateAppConfig = {
 *   logLevel: "warn", // Capture uniquement les warnings et erreurs
 *   encryption: { enabled: true }
 * };
 *
 * // Configuration pour l'environnement de développement
 * const devConfig: CreateAppConfig = {
 *   logLevel: "debug", // Capture tous les niveaux de logs
 *   encryption: { enabled: false }
 * };
 * ```
 *
 * @see {@link ConsoleConfig} pour la configuration de l'affichage des niveaux
 * @see {@link AppConfig} pour intégrer le niveau dans une configuration complète
 */
export type LogLevel = "error" | "warn" | "info" | "debug";

/**
 * Configuration du chiffrement des logs
 * @interface Encryption
 * @description Définit les paramètres de sécurisation des logs via le chiffrement des données.
 * Cette configuration permet de protéger les informations sensibles contenues dans les logs.
 *
 * @property {boolean} enabled - Active/désactive le chiffrement des logs
 * @property {string} [key] - Clé de chiffrement personnalisée (optionnelle)
 *
 * @remarks
 * Le chiffrement est essentiel pour :
 * - Protéger les données sensibles des utilisateurs
 * - Assurer la conformité avec les réglementations (RGPD, HIPAA, etc.)
 * - Sécuriser les informations d'identification et autres secrets
 *
 * Si aucune clé n'est fournie mais que le chiffrement est activé, le système
 * génère automatiquement une clé sécurisée. Les logs chiffrés ne sont lisibles
 * qu'après déchiffrement avec la clé correspondante.
 *
 * @example
 * ```typescript
 * // Configuration simple avec chiffrement activé
 * const basicEncryption: Encryption = {
 *   enabled: true
 * };
 *
 * // Configuration avec clé personnalisée
 * const customEncryption: Encryption = {
 *   enabled: true,
 *   key: "ma-clé-de-chiffrement-personnalisée-très-sécurisée"
 * };
 * ```
 *
 * @throws {Error} Si la clé fournie n'est pas suffisamment sécurisée
 *
 * @see {@link CreateAppConfig} pour intégrer cette configuration
 * @see {@link ConsoleConfig} pour la visualisation des logs chiffrés
 */
export interface Encryption {
  /** Active ou désactive le chiffrement */
  enabled: boolean;
  /** Clé de chiffrement personnalisée (optionnelle) */
  key?: string;
}

/**
 * Configuration de l'affichage des logs dans la console
 * @interface ConsoleConfig
 * @description Définit comment les logs doivent être formatés et affichés dans
 * la console. Cette configuration permet de personnaliser la présentation des
 * logs pour une meilleure lisibilité et débogage.
 *
 * @property {boolean} enabled - Active/désactive l'affichage console
 * @property {boolean} showTimestamp - Ajoute l'horodatage aux logs affichés
 * @property {boolean} showLogLevel - Affiche le niveau de criticité du log
 * @property {boolean} colorized - Active la coloration syntaxique selon le niveau
 * @property {"simple" | "detailed" | "json"} format - Format d'affichage des logs
 *
 * @remarks
 * Les formats disponibles offrent différents niveaux de détail :
 * - "simple" : uniquement le message principal, idéal pour les environnements de production
 * - "detailed" : inclut les métadonnées (timestamp, niveau, etc.), utile pour le débogage
 * - "json" : format structuré pour l'intégration avec d'autres outils d'analyse
 *
 * La coloration syntaxique utilise généralement :
 * - Rouge pour les erreurs
 * - Jaune/Orange pour les warnings
 * - Bleu/Vert pour les infos
 * - Gris pour les messages debug
 *
 * @example
 * ```typescript
 * // Configuration pour le développement
 * const devConsole: ConsoleConfig = {
 *   enabled: true,
 *   showTimestamp: true,
 *   showLogLevel: true,
 *   colorized: true,
 *   format: "detailed"
 * };
 *
 * // Configuration pour la production
 * const prodConsole: ConsoleConfig = {
 *   enabled: true,
 *   showTimestamp: false,
 *   showLogLevel: true,
 *   colorized: false,
 *   format: "simple"
 * };
 * ```
 *
 * @see {@link LogLevel} pour les niveaux de log disponibles
 * @see {@link CreateAppConfig} pour intégrer cette configuration
 */
export interface ConsoleConfig {
  /** Active ou désactive l'affichage console */
  enabled: boolean;
  /** Affiche l'horodatage dans les logs */
  showTimestamp: boolean;
  /** Affiche le niveau de log */
  showLogLevel: boolean;
  /** Active la coloration syntaxique des logs */
  colorized: boolean;
  /** Format d'affichage des logs */
  format: "simple" | "detailed" | "json";
}

/**
 * Configuration du stockage persistant des logs
 * @interface PersistenceConfig
 * @description Définit comment les logs doivent être stockés sur le disque.
 * Cette configuration permet de gérer la rotation des fichiers, leur taille
 * et leur durée de conservation.
 *
 * @property {boolean} enabled - Active/désactive le stockage persistant
 * @property {number} maxSize - Taille maximale d'un fichier de log en MB avant rotation
 * @property {"hourly" | "daily" | "weekly"} rotationInterval - Fréquence de rotation des logs
 * @property {number} retentionPeriod - Durée de conservation des logs en jours
 * @property {boolean} compressArchives - Compression des fichiers archivés
 *
 * @remarks
 * La gestion des fichiers de logs est essentielle pour :
 * - Contrôler l'espace disque utilisé
 * - Optimiser les performances d'écriture et de lecture
 * - Faciliter l'archivage et la sauvegarde
 * - Respecter les politiques de conservation des données
 *
 * Les fichiers de logs sont nommés selon le format : `{appId}-YYYY-MM-DD[-HH].log`
 * Les archives compressées utilisent l'extension `.gz` ou `.zip`
 *
 * @example
 * ```typescript
 * // Configuration pour un environnement de développement
 * const devPersistence: PersistenceConfig = {
 *   enabled: true,
 *   maxSize: 10, // 10 MB par fichier
 *   rotationInterval: "daily",
 *   retentionPeriod: 7, // Conservation 7 jours
 *   compressArchives: false
 * };
 *
 * // Configuration pour un environnement de production
 * const prodPersistence: PersistenceConfig = {
 *   enabled: true,
 *   maxSize: 100, // 100 MB par fichier
 *   rotationInterval: "hourly",
 *   retentionPeriod: 90, // Conservation 90 jours
 *   compressArchives: true
 * };
 * ```
 *
 * @throws {Error} Si maxSize est inférieur à 1 ou supérieur à 1000 MB
 * @throws {Error} Si retentionPeriod est inférieur à 1 ou supérieur à 365 jours
 *
 * @see {@link CreateAppConfig} pour intégrer cette configuration
 * @see {@link NetworkConfig} pour la configuration d'envoi des logs au serveur
 */
export interface PersistenceConfig {
  /** Active ou désactive le stockage persistant */
  enabled: boolean;
  /** Taille maximale des fichiers de log en MB */
  maxSize: number;
  /** Fréquence de rotation des fichiers de log */
  rotationInterval: "hourly" | "daily" | "weekly";
  /** Durée de conservation des logs en jours */
  retentionPeriod: number;
  /** Active la compression des archives */
  compressArchives: boolean;
}

/**
 * Configuration des paramètres réseau
 * @interface NetworkConfig
 * @description Définit les paramètres de communication réseau pour l'envoi des logs
 * au serveur central et la gestion des erreurs de connexion.
 *
 * @property {number} batchSize - Nombre de logs à regrouper par envoi (1-1000)
 * @property {number} retryAttempts - Nombre de tentatives en cas d'échec réseau (0-10)
 * @property {number} retryDelay - Délai entre les tentatives en millisecondes
 * @property {number} timeout - Délai maximum d'attente pour une requête en ms
 * @property {boolean} offlineStorage - Active le stockage temporaire hors ligne
 * @property {number} maxOfflineSize - Taille maximale du stockage hors ligne en MB
 *
 * @remarks
 * La configuration réseau optimise :
 * - L'utilisation de la bande passante en regroupant les logs
 * - La résilience face aux problèmes de connectivité
 * - La gestion de la mémoire locale en cas de déconnexion
 * - Les performances globales du système de logging
 *
 * Le stockage hors ligne permet de conserver temporairement les logs
 * lorsque la connexion au serveur est impossible. Ces logs sont envoyés
 * automatiquement dès que la connexion est rétablie.
 *
 * @example
 * ```typescript
 * // Configuration réseau pour application mobile
 * const mobileNetwork: NetworkConfig = {
 *   batchSize: 20,
 *   retryAttempts: 5,
 *   retryDelay: 5000, // 5 secondes
 *   timeout: 10000, // 10 secondes
 *   offlineStorage: true,
 *   maxOfflineSize: 50 // 50 MB
 * };
 *
 * // Configuration réseau pour serveur
 * const serverNetwork: NetworkConfig = {
 *   batchSize: 100,
 *   retryAttempts: 3,
 *   retryDelay: 1000, // 1 seconde
 *   timeout: 5000, // 5 secondes
 *   offlineStorage: true,
 *   maxOfflineSize: 200 // 200 MB
 * };
 * ```
 *
 * @throws {Error} Si batchSize est hors limites (1-1000)
 * @throws {Error} Si retryAttempts est hors limites (0-10)
 * @throws {Error} Si retryDelay est inférieur à 100ms
 * @throws {Error} Si maxOfflineSize est inférieur à 1 ou supérieur à 1000 MB
 *
 * @see {@link CreateAppConfig} pour intégrer cette configuration
 * @see {@link PersistenceConfig} pour le stockage permanent des logs
 */
export interface NetworkConfig {
  /** Nombre de logs par lot d'envoi */
  batchSize: number;
  /** Nombre de tentatives de reconnexion */
  retryAttempts: number;
  /** Délai entre les tentatives en ms */
  retryDelay: number;
  /** Timeout des requêtes en ms */
  timeout: number;
  /** Active le stockage hors ligne */
  offlineStorage: boolean;
  /** Taille maximale du stockage hors ligne en MB */
  maxOfflineSize: number;
}

/**
 * Configuration du monitoring des performances
 * @interface PerformanceConfig
 * @description Définit les paramètres de surveillance des performances
 * de l'application et la collecte des métriques système.
 *
 * @property {boolean} enabled - Active/désactive le monitoring des performances
 * @property {number} samplingRate - Taux d'échantillonnage en pourcentage (0-100)
 * @property {number} maxEventsPerSecond - Nombre maximum d'événements collectés par seconde
 * @property {boolean} monitorMemory - Active la surveillance de l'utilisation mémoire
 * @property {boolean} monitorCPU - Active la surveillance de l'utilisation CPU
 *
 * @remarks
 * Le monitoring des performances permet de :
 * - Identifier les problèmes de performance avant qu'ils n'affectent les utilisateurs
 * - Comprendre l'impact du logging sur les ressources système
 * - Établir des lignes de base pour optimiser l'application
 * - Détecter les anomalies de comportement
 *
 * Le samplingRate permet de réduire l'impact du monitoring sur les performances
 * en ne collectant qu'un pourcentage des métriques disponibles. Par exemple,
 * un taux de 10% signifie qu'une métrique sur dix sera enregistrée.
 *
 * @example
 * ```typescript
 * // Configuration légère pour environnement de production
 * const lightPerformance: PerformanceConfig = {
 *   enabled: true,
 *   samplingRate: 5, // 5% des métriques
 *   maxEventsPerSecond: 50,
 *   monitorMemory: true,
 *   monitorCPU: false
 * };
 *
 * // Configuration complète pour environnement de test
 * const fullPerformance: PerformanceConfig = {
 *   enabled: true,
 *   samplingRate: 100, // Toutes les métriques
 *   maxEventsPerSecond: 200,
 *   monitorMemory: true,
 *   monitorCPU: true
 * };
 * ```
 *
 * @throws {Error} Si samplingRate est hors limites (0-100)
 * @throws {Error} Si maxEventsPerSecond est inférieur à 1
 *
 * @see {@link CreateAppConfig} pour intégrer cette configuration
 * @see {@link NetworkConfig} pour la configuration d'envoi des métriques
 */
export interface PerformanceConfig {
  /** Active ou désactive le monitoring */
  enabled: boolean;
  /** Taux d'échantillonnage des métriques (0-100%) */
  samplingRate: number;
  /** Nombre maximum d'événements par seconde */
  maxEventsPerSecond: number;
  /** Active le monitoring de la mémoire */
  monitorMemory: boolean;
  /** Active le monitoring du CPU */
  monitorCPU: boolean;
}

/**
 * Configuration pour la création d'une nouvelle application
 * @interface CreateAppConfig
 * @description Configuration requise lors de la création d'une nouvelle application
 * dans le système de logging. Définit les comportements et fonctionnalités activés.
 *
 * @property {LogLevel} logLevel - Niveau de log global pour l'application
 * @property {Encryption} encryption - Configuration du chiffrement des logs
 * @property {ConsoleConfig} [console] - Configuration de l'affichage console (optionnel)
 * @property {PersistenceConfig} [persistence] - Configuration du stockage persistant (optionnel)
 * @property {NetworkConfig} [network] - Configuration réseau pour l'envoi des logs (optionnel)
 * @property {PerformanceConfig} [performance] - Configuration du monitoring (optionnel)
 *
 * @remarks
 * Lors de la création d'une application, seuls le niveau de log et les paramètres
 * de chiffrement sont obligatoires. Les autres configurations sont optionnelles
 * et utiliseront des valeurs par défaut si non spécifiées.
 *
 * Les valeurs par défaut sont généralement adaptées à un environnement
 * de développement et devraient être ajustées pour la production.
 *
 * @example
 * ```typescript
 * // Configuration minimale
 * const minimalConfig: CreateAppConfig = {
 *   logLevel: "info",
 *   encryption: { enabled: false }
 * };
 *
 * // Configuration complète pour la production
 * const productionConfig: CreateAppConfig = {
 *   logLevel: "warn",
 *   encryption: {
 *     enabled: true,
 *     key: "clé-sécurisée"
 *   },
 *   console: {
 *     enabled: true,
 *     showTimestamp: true,
 *     showLogLevel: true,
 *     colorized: false,
 *     format: "simple"
 *   },
 *   persistence: {
 *     enabled: true,
 *     maxSize: 100,
 *     rotationInterval: "daily",
 *     retentionPeriod: 90,
 *     compressArchives: true
 *   },
 *   network: {
 *     batchSize: 100,
 *     retryAttempts: 3,
 *     retryDelay: 1000,
 *     timeout: 5000,
 *     offlineStorage: true,
 *     maxOfflineSize: 200
 *   },
 *   performance: {
 *     enabled: true,
 *     samplingRate: 10,
 *     maxEventsPerSecond: 100,
 *     monitorMemory: true,
 *     monitorCPU: true
 *   }
 * };
 * ```
 *
 * @see {@link CreateAppRequest} pour créer une nouvelle application
 * @see {@link AppConfig} pour la configuration complète après création
 */
export interface CreateAppConfig {
  /** Niveau de log global */
  logLevel: LogLevel;
  /** Configuration du chiffrement */
  encryption: Encryption;
  /** Configuration de la console */
  console?: ConsoleConfig;
  /** Configuration du stockage persistant */
  persistence?: PersistenceConfig;
  /** Configuration réseau */
  network?: NetworkConfig;
  /** Configuration du monitoring des performances */
  performance?: PerformanceConfig;
}

/**
 * Requête pour créer une nouvelle application
 * @interface CreateAppRequest
 * @description Structure de données pour la requête de création d'une nouvelle
 * application dans le système.
 *
 * @property {string} name - Nom de l'application à créer
 * @property {string} [description] - Description optionnelle de l'application
 * @property {CreateAppConfig} config - Configuration initiale de l'application
 *
 * @remarks
 * Le nom de l'application doit être unique pour l'utilisateur.
 * La configuration est obligatoire et doit au minimum contenir les
 * propriétés logLevel et encryption.
 *
 * L'identifiant unique (id) et la clé API (apiKey) seront générés
 * automatiquement par le serveur lors de la création.
 *
 * @example
 * ```typescript
 * // Création d'une application de production
 * const createProdApp: CreateAppRequest = {
 *   name: "Production Backend",
 *   description: "Serveur principal de production",
 *   config: {
 *     logLevel: "warn",
 *     encryption: { enabled: true },
 *     persistence: {
 *       enabled: true,
 *       maxSize: 100,
 *       rotationInterval: "daily",
 *       retentionPeriod: 90,
 *       compressArchives: true
 *     }
 *   }
 * };
 *
 * // Création d'une application de développement
 * const createDevApp: CreateAppRequest = {
 *   name: "Dev Environment",
 *   config: {
 *     logLevel: "debug",
 *     encryption: { enabled: false }
 *   }
 * };
 * ```
 *
 * @throws {Error} Si le nom est vide ou déjà utilisé
 * @throws {Error} Si la configuration est invalide
 *
 * @see {@link CreateAppResponse} pour la réponse à cette requête
 * @see {@link CreateAppConfig} pour les détails de configuration
 */
export interface CreateAppRequest {
  /** Nom de l'application */
  name: string;
  /** Description optionnelle */
  description?: string;
  /** Configuration optionnelle */
  config: CreateAppConfig;
}

/**
 * Réponse de création d'application
 * @interface CreateAppResponse
 * @description Structure de données retournée par le serveur après la création
 * réussie d'une application.
 *
 * @property {App} app - L'objet application créé avec ses identifiants
 * @property {CreateAppConfig} config - La configuration validée et appliquée
 *
 * @remarks
 * La réponse contient l'objet App complet avec les identifiants générés
 * automatiquement (id, apiKey) ainsi que la configuration telle qu'elle
 * a été appliquée par le système.
 *
 * Il est important de conserver la clé API (app.apiKey) car elle sera
 * nécessaire pour authentifier les requêtes futures et ne pourra pas
 * être récupérée ultérieurement pour des raisons de sécurité.
 *
 * @example
 * ```typescript
 * // Exemple de réponse après création d'application
 * const response: CreateAppResponse = {
 *   app: {
 *     id: "app-550e8400-e29b-41d4-a716-446655440000",
 *     name: "Production Backend",
 *     apiKey: "key-a716446655440000",
 *     createdAt: "2024-03-20T10:00:00Z",
 *     userId: "user-41d4a716446655440000",
 *     status: "active",
 *     description: "Serveur principal de production"
 *   },
 *   config: {
 *     logLevel: "warn",
 *     encryption: { enabled: true },
 *     persistence: {
 *       enabled: true,
 *       maxSize: 100,
 *       rotationInterval: "daily",
 *       retentionPeriod: 90,
 *       compressArchives: true
 *     }
 *   }
 * };
 * ```
 *
 * @see {@link CreateAppRequest} pour la requête correspondante
 * @see {@link App} pour la structure d'une application
 */
export interface CreateAppResponse {
  /** L'application créée */
  app: App;
  /** La configuration de l'application */
  config: CreateAppConfig;
}

/**
 * Réponse contenant la liste des applications
 * @interface AppListResponse
 * @description Structure de données retournée par le serveur pour la requête
 * de liste des applications de l'utilisateur.
 *
 * @property {App[]} apps - Tableau des applications de l'utilisateur
 *
 * @remarks
 * Cette réponse est généralement obtenue lors d'une requête GET sur le point
 * d'accès /apps ou équivalent. Le tableau peut être vide si l'utilisateur
 * n'a pas encore créé d'applications.
 *
 * Les applications sont triées par défaut selon leur date de création, de
 * la plus récente à la plus ancienne. Seules les informations de base sont
 * incluses dans cette liste, sans les détails de configuration.
 *
 * @example
 * ```typescript
 * // Exemple de réponse contenant trois applications
 * const appList: AppListResponse = {
 *   apps: [
 *     {
 *       id: "app-550e8400-e29b-41d4-a716-446655440000",
 *       name: "Production Backend",
 *       apiKey: "key-a716446655440000",
 *       createdAt: "2024-03-20T10:00:00Z",
 *       userId: "user-41d4a716446655440000",
 *       status: "active",
 *       lastActivity: "2024-03-30T15:42:00Z"
 *     },
 *     {
 *       id: "app-660e8400-e29b-41d4-a716-446655550000",
 *       name: "Staging Environment",
 *       apiKey: "key-b716446655550000",
 *       createdAt: "2024-03-15T14:30:00Z",
 *       userId: "user-41d4a716446655440000",
 *       status: "active",
 *       lastActivity: "2024-03-29T18:22:00Z"
 *     },
 *     {
 *       id: "app-770e8400-e29b-41d4-a716-446655660000",
 *       name: "Legacy System",
 *       apiKey: "key-c716446655660000",
 *       createdAt: "2024-02-10T09:15:00Z",
 *       userId: "user-41d4a716446655440000",
 *       status: "inactive",
 *       lastActivity: "2024-03-01T11:05:00Z"
 *     }
 *   ]
 * };
 * ```
 *
 * @see {@link App} pour la structure d'une application
 * @see {@link AppConfig} pour la configuration détaillée d'une application
 */
export interface AppListResponse {
  /** Liste des applications */
  apps: App[];
}

export interface PerformanceMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    connections: number;
  };
  processes: {
    total: number;
    running: number;
    blocked: number;
  };
  timestamp: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  message: string;
  context?: Record<string, any>;
  source?: string;
  tags?: string[];
  metadata?: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    [key: string]: any;
  };
}

export interface Anomaly {
  id: string;
  type: "performance" | "error" | "security";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: string;
  metrics?: PerformanceMetrics;
  logs?: LogEntry[];
  status: "active" | "resolved" | "investigating";
}

export interface TimeRange {
  start: string;
  end: string;
  type: "hour" | "day" | "week";
}

export type commandType = "console_toggle" | "encryption_toggle";
export interface CommandData {
  type: commandType;
  data: any;
  userId: string;
  appId: string;
}

export interface UserAction {
  id: string;
  userId: string;
  appId: string;
  type: commandType;
  data: CommandData;
  timestamp: number;
  status: "success" | "error" | "pending";
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    platform?: string;
  };
}
