export enum ErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  INVALID_CONFIG = "INVALID_CONFIG",
  CACHE_ERROR = "CACHE_ERROR",
  SECURITY_ERROR = "SECURITY_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  ENCRYPTION_ERROR = "ENCRYPTION_ERROR",
  INITIALIZATION_ERROR = "INITIALIZATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
}

export interface ErrorDetails {
  timestamp: string;
  code: ErrorCode;
  context?: Record<string, unknown>;
  cause?: Error;
  suggestions?: string[];
  // Rétrocompatibilité
  errors?: string[];
  details?: any;
  status?: number;
  contentType?: string | null;
  origin?: string;
}

export class WebConfigError extends Error {
  public readonly timestamp: string;
  public readonly errorDetails: ErrorDetails;
  // Pour la rétrocompatibilité
  public readonly code: ErrorCode;
  public readonly details: any;

  constructor(
    message: string,
    code: ErrorCode,
    details?: {
      context?: Record<string, unknown>;
      cause?: Error;
      suggestions?: string[];
      errors?: string[];
      details?: any;
      status?: number;
      contentType?: string | null;
      origin?: string;
    }
  ) {
    const timestamp = new Date().toISOString();

    // Construction d'un message d'erreur détaillé
    const fullMessage = [
      `[NEHONIX-${code}] ${message}`,
      details?.context
        ? `\nContext: ${JSON.stringify(details.context, null, 2)}`
        : "",
      details?.cause ? `\nCause: ${details.cause.message}` : "",
      details?.suggestions?.length
        ? `\nSuggestions:\n${details.suggestions
            .map((s) => `  - ${s}`)
            .join("\n")}`
        : "",
      // Support des anciens messages d'erreur
      details?.errors?.length
        ? `\nErrors:\n${details.errors.map((e) => `  - ${e}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("");

    super(fullMessage);

    this.name = "NEHONIX WebConfigError";
    this.timestamp = timestamp;
    this.code = code; // Pour la rétrocompatibilité
    this.details = details?.details || details; // Pour la rétrocompatibilité

    // Nouvelle structure
    this.errorDetails = {
      timestamp,
      code,
      context: details?.context,
      cause: details?.cause,
      suggestions: details?.suggestions,
      errors: details?.errors,
      details: details?.details,
      status: details?.status,
      contentType: details?.contentType,
      origin: details?.origin,
    };

    Object.setPrototypeOf(this, WebConfigError.prototype);
  }

  /**
   * Retourne une représentation JSON de l'erreur
   */
  public toJSON(): ErrorDetails {
    return this.errorDetails;
  }

  /**
   * Retourne une représentation formatée de l'erreur pour le logging
   */
  public getFormattedMessage(): string {
    return `
NEHONIX Error Report
-------------------
Timestamp: ${this.timestamp}
Error Code: ${this.errorDetails.code}
Message: ${this.message}
${
  this.errorDetails.context
    ? `\nContext:\n${JSON.stringify(this.errorDetails.context, null, 2)}`
    : ""
}
${this.errorDetails.cause ? `\nCause: ${this.errorDetails.cause.message}` : ""}
${
  this.errorDetails.suggestions?.length
    ? `\nSuggestions:\n${this.errorDetails.suggestions
        .map((s) => `  - ${s}`)
        .join("\n")}`
    : ""
}
${
  this.errorDetails.errors?.length
    ? `\nErrors:\n${this.errorDetails.errors.map((e) => `  - ${e}`).join("\n")}`
    : ""
}
-------------------`;
  }

  /**
   * Crée une erreur réseau avec des suggestions appropriées
   */
  public static createNetworkError(url: string, error: Error): WebConfigError {
    return new WebConfigError(
      "Failed to fetch configuration",
      ErrorCode.NETWORK_ERROR,
      {
        context: { url, originalError: error.message },
        cause: error,
        suggestions: [
          "Vérifiez votre connexion internet",
          "Assurez-vous que l'URL est correcte et accessible",
          "Vérifiez les paramètres de votre pare-feu",
          "Si le problème persiste, contactez le support NEHONIX",
        ],
      }
    );
  }

  /**
   * Crée une erreur de validation avec des détails sur les champs invalides
   */
  public static createValidationError(
    invalidFields: Record<string, string>
  ): WebConfigError {
    return new WebConfigError(
      "Configuration validation failed",
      ErrorCode.VALIDATION_ERROR,
      {
        context: { invalidFields },
        suggestions: [
          "Vérifiez le format de votre configuration",
          "Assurez-vous que tous les champs requis sont présents",
          "Consultez la documentation pour le schéma de configuration correct",
        ],
        // Pour la rétrocompatibilité
        errors: Object.entries(invalidFields).map(
          ([field, error]) => `${field}: ${error}`
        ),
      }
    );
  }

  /**
   * Crée une erreur de sécurité
   */
  public static createSecurityError(
    reason: string,
    details?: Record<string, unknown>
  ): WebConfigError {
    return new WebConfigError(
      `Security check failed: ${reason}`,
      ErrorCode.SECURITY_ERROR,
      {
        context: details,
        suggestions: [
          "Vérifiez vos paramètres de sécurité",
          "Assurez-vous d'utiliser HTTPS",
          "Vérifiez vos tokens d'authentification",
        ],
        // Pour la rétrocompatibilité
        details,
      }
    );
  }

  /**
   * Méthode utilitaire pour la rétrocompatibilité
   * Convertit l'ancien format d'erreur vers le nouveau
   */
  public static fromLegacy(
    message: string,
    code: ErrorCode,
    details?: any
  ): WebConfigError {
    return new WebConfigError(message, code, {
      details,
      errors: Array.isArray(details?.errors) ? details.errors : undefined,
      context: typeof details === "object" ? details : undefined,
    });
  }
}
