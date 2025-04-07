import { NSL_CONFIG } from "../types/type";
import { WebConfigLoader } from "./config/WebConfigLoader";
import { ConfigCache } from "./config/ConfigCache";
import { SecurityService } from "./config/SecurityService";
import { ConfigValidator } from "./config/ConfigValidator";
import { MetricsCollector, MetricsSummary } from "./config/MetricsCollector";
import { WebConfigError, ErrorCode } from "../types/errors";

export interface WebConfigOptions {
  auth?: {
    type: "bearer" | "basic";
    token: string;
  };
  encryption?: {
    enabled: boolean;
    algorithm?: string;
    key?: string;
  };
  cache?: {
    enabled: boolean;
    duration?: string;
    maxSize?: number;
  };
  security?: {
    validateSSL: boolean;
    validateContent: boolean;
  };
}

export class WebConfigService {
  private static instance: WebConfigService;
  private loader: WebConfigLoader;
  private cache: ConfigCache;
  private security: SecurityService;
  private validator: ConfigValidator;
  private metrics: MetricsCollector;

  private constructor() {
    this.cache = new ConfigCache();
    this.security = new SecurityService();
    this.validator = new ConfigValidator();
    this.metrics = new MetricsCollector();
    this.loader = new WebConfigLoader(
      this.cache,
      this.security,
      this.validator,
      this.metrics
    );
  }

  public static getInstance(): WebConfigService {
    if (!WebConfigService.instance) {
      WebConfigService.instance = new WebConfigService();
    }
    return WebConfigService.instance;
  }

  /**
   * Charge une configuration depuis une URL
   * @param url L'URL de la configuration
   * @param options Options de configuration
   */
  public async loadConfig(
    url: string,
    options?: WebConfigOptions
  ): Promise<NSL_CONFIG> {
    try {
      // Démarrer le chrono pour les métriques
      const startTime = this.metrics.startOperation("loadConfig");

      // Valider l'URL
      try {
        this.security.validateUrl(url);
      } catch (error) {
        this.metrics.endOperation(
          "loadConfig",
          startTime,
          false,
          "Invalid URL"
        );
        throw error;
      }

      // Vérifier le cache si activé
      if (options?.cache?.enabled) {
        const cached = this.cache.get(url);
        if (cached) {
          const cacheStartTime = this.metrics.startOperation("cacheAccess");
          this.metrics.endOperation("cacheAccess", cacheStartTime, true);
          this.metrics.endOperation("loadConfig", startTime, true);
          return cached;
        }
        const cacheStartTime = this.metrics.startOperation("cacheAccess");
        this.metrics.endOperation("cacheAccess", cacheStartTime, false);
      }

      // Charger la configuration
      const config = await this.loader.load(url, options);

      // Valider la configuration
      this.validator.validate(config);

      // Mettre en cache si activé
      if (options?.cache?.enabled) {
        this.cache.set(url, config, {
          duration: options.cache.duration,
          maxSize: options.cache.maxSize,
        });
      }

      // Enregistrer les métriques
      this.metrics.endOperation("loadConfig", startTime, true);

      return config;
    } catch (error) {
      if (error instanceof WebConfigError) {
        throw error;
      }
      throw new WebConfigError(
        "Error while loading config",
        ErrorCode.NETWORK_ERROR,
        { cause: error as Error }
      );
    }
  }

  /**
   * Précharge une configuration
   * @param url L'URL de la configuration
   * @param options Options de configuration
   */
  public preloadConfig(url: string, options?: WebConfigOptions): void {
    this.loadConfig(url, options).catch(() => {
      // Ignorer les erreurs en préchargement
    });
  }

  /**
   * Invalide le cache pour une URL donnée
   * @param url L'URL de la configuration
   */
  public invalidateCache(url: string): void {
    this.cache.clear(url);
  }

  /**
   * Récupère les métriques de performance
   */
  public getMetrics(): MetricsSummary {
    return this.metrics.getMetrics();
  }

  /**
   * Réinitialise le service
   */
  public reset(): void {
    this.cache.clear();
    this.metrics.clear();
  }
}

// Export d'une instance singleton
export const webConfigService = WebConfigService.getInstance();
