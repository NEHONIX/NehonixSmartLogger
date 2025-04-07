import { WebConfigError, ErrorCode } from "../../types/errors";

interface SecurityOptions {
  validateSSL?: boolean;
  validateOrigin?: boolean;
  allowedOrigins?: string[];
  authToken?: string;
}

export class SecurityService {
  private options: SecurityOptions;

  constructor(options: SecurityOptions = {}) {
    this.options = {
      validateSSL: true,
      validateOrigin: true,
      allowedOrigins: [],
      ...options,
    };
  }

  public validateUrl(url: string): void {
    try {
      const parsedUrl = new URL(url);

      if (this.options.validateSSL && parsedUrl.protocol !== "https:") {
        throw new WebConfigError(
          "Le protocole HTTPS est requis",
          ErrorCode.SECURITY_ERROR
        );
      }

      if (this.options.validateOrigin && this.options.allowedOrigins?.length) {
        const isAllowed = this.options.allowedOrigins.some((origin) =>
          parsedUrl.origin.toLowerCase().includes(origin.toLowerCase())
        );

        if (!isAllowed) {
          throw new WebConfigError(
            "Origine non autorisée",
            ErrorCode.SECURITY_ERROR,
            { origin: parsedUrl.origin }
          );
        }
      }
    } catch (error) {
      if (error instanceof WebConfigError) throw error;

      throw new WebConfigError("URL invalide", ErrorCode.SECURITY_ERROR, {
        cause: error as Error,
      });
    }
  }

  public getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.options.authToken) {
      headers["Authorization"] = `Bearer ${this.options.authToken}`;
    }

    return headers;
  }

  public validateResponse(response: Response): void {
    if (!response.ok) {
      throw new WebConfigError(
        "Invalid HTTP response",
        ErrorCode.SECURITY_ERROR,
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new WebConfigError(
        "Type de contenu invalide",
        ErrorCode.SECURITY_ERROR,
        { contentType }
      );
    }
  }

  public setAuthToken(token: string): void {
    this.options.authToken = token;
  }

  public addAllowedOrigin(origin: string): void {
    if (!this.options.allowedOrigins) {
      this.options.allowedOrigins = [];
    }
    this.options.allowedOrigins.push(origin);
  }
}
