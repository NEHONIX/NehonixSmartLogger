import { NSL_CONFIG } from "../../types/type";
import { ConfigCache } from "./ConfigCache";
import { SecurityService } from "./SecurityService";
import { ConfigValidator } from "./ConfigValidator";
import { MetricsCollector } from "./MetricsCollector";
import { WebConfigOptions } from "../WebConfigService";
import { WebConfigError, ErrorCode } from "../../types/errors";
import https from "https";

export class WebConfigLoader {
  constructor(
    private cache: ConfigCache,
    private security: SecurityService,
    private validator: ConfigValidator,
    private metrics: MetricsCollector
  ) {}

  public async load(
    url: string,
    options?: WebConfigOptions
  ): Promise<NSL_CONFIG> {
    try {
      const response = await this.fetchWithRetry(url, options);
      const config = await this.parseConfig(response);
      return config;
    } catch (error) {
      throw new WebConfigError(
        "Error while loading config",
        ErrorCode.NETWORK_ERROR,
        { cause: error as Error }
      );
    }
  }

  private async fetchWithRetry(
    url: string,
    options?: WebConfigOptions,
    retryCount = 3
  ): Promise<string> {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        return await this.fetch(url, options);
      } catch (error) {
        if (attempt === retryCount) throw error;
        await this.delay(1000 * attempt); // Délai exponentiel
      }
    }
    throw new Error("Maximum number of attempts reached");
  }

  private async fetch(
    url: string,
    options?: WebConfigOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const headers: { [key: string]: string } = {};

      if (options?.auth) {
        switch (options.auth.type) {
          case "bearer":
            headers["Authorization"] = `Bearer ${options.auth.token}`;
            break;
          case "basic":
            headers["Authorization"] = `Basic ${Buffer.from(
              options.auth.token
            ).toString("base64")}`;
            break;
        }
      }

      const httpsOptions = {
        headers,
        rejectUnauthorized: options?.security?.validateSSL !== false,
      };

      https
        .get(url, httpsOptions, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
            return;
          }

          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(data));
        })
        .on("error", reject);
    });
  }

  private async parseConfig(data: string): Promise<NSL_CONFIG> {
    try {
      return JSON.parse(data) as NSL_CONFIG;
    } catch (error) {
      throw new WebConfigError(
        "Invalid config format, please check the config file and retry",
        ErrorCode.INVALID_CONFIG
        // { cause: error as Error }
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
