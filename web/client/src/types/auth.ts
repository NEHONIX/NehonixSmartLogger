export type UserTarget = "dev" | "entreprise" | "guess";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
  target: UserTarget;
  name: string;
  entrepriseName?: string;
}

export interface AuthError {
  field?: string;
  message: string;
}

export interface AuthResponse {
  user: NSLUserDataInterface;
  token: string;
}

export interface CheckAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: NSLUserDataInterface;
    decodedToken: NSLUserDataInterface;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    uid: string;
    email: string | undefined;
    username: string;
    name: string;
    status: string;
    message: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    authCookieResponse: string;
    user: NSLUserDataInterface;
    userCredential: FirebaseAuthResponseInterface;
  };
}

/**
 * Interface représentant les données d'un utilisateur dans le système
 * @typedef {Object} UserDataInterface
 */
export interface NSLUserDataInterface {
  /**
   * Identifiant unique de l'utilisateur
   */
  uid: string;

  /**
   * Nom de l'utilisateur
   */
  name: string;

  /**
   * Nom d'utilisateur
   */
  username: string;

  /**
   * Adresse email de l'utilisateur
   */
  email: string;

  /**
   * Domaine de l'email de l'utilisateur
   */
  emailDomain: string | null;

  /**
   * Type d'utilisateur: "dev" | "entreprise" | "guess"
   */
  target: UserTarget;

  /**
   * Nom de l'entreprise (uniquement pour le type "entreprise")
   */
  entrepriseName?: string | null;

  /**
   * Empreinte unique de l'appareil utilisé pour l'inscription
   */
  deviceFingerprint: string;

  /**
   * Adresse IP utilisée lors de l'inscription
   */
  ipAddress: string;

  /**
   * Statut du compte: "active" | "inactive" | "suspended" | "banned"
   */
  status: "active" | "inactive" | "suspended" | "banned";

  /**
   * Indique si l'email a été vérifié
   */
  emailVerified: boolean;

  /**
   * Date de la dernière connexion
   */
  lastLogin: Date | null;

  /**
   * Nombre total de connexions
   */
  loginAttempts: number;

  /**
   * Date de création du compte
   */
  createdAt: Date;

  /**
   * Date de la dernière mise à jour
   */
  updatedAt: Date;

  /**
   * Métadonnées de l'appareil
   */
  metadata: {
    /**
     * User-Agent du navigateur
     */
    userAgent?: string;

    /**
     * Plateforme utilisée
     */
    platform?: string;

    /**
     * Langue du navigateur
     */
    language?: string;
  };
}

/**
 * Interface représentant la réponse de vérification de mot de passe Firebase
 * @typedef {Object} FirebaseAuthResponseInterface
 */
export interface FirebaseAuthResponseInterface {
  /**
   * Type de réponse de l'API Identity Toolkit de Firebase
   * @constant {'identitytoolkit#VerifyPasswordResponse'}
   */
  kind: string;

  /**
   * Identifiant unique de l'utilisateur dans Firebase
   * @example 'b6CyC6xtqpUHJL2hIrWajKfxpdJ2'
   */
  localId: string;

  /**
   * Adresse email de l'utilisateur
   */
  email: string;

  /**
   * Nom d'affichage de l'utilisateur (peut être vide)
   */
  displayName: string;

  /**
   * Token JWT d'authentification
   * Contient les informations de l'utilisateur et est utilisé pour authentifier les requêtes
   * @expires 1 heure par défaut
   */
  idToken: string;

  /**
   * Indique si l'utilisateur est déjà enregistré dans Firebase
   * @type {boolean}
   */
  registered: boolean;

  /**
   * Token utilisé pour obtenir un nouveau idToken lorsque celui-ci expire
   * @security À stocker de manière sécurisée
   */
  refreshToken: string;

  /**
   * Durée de validité du token en secondes
   * @example '3600' pour 1 heure
   */
  expiresIn: string;
}
