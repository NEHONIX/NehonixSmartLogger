import { NSL_CONFIG } from "../../types/type";
import { WebConfigError, ErrorCode } from "../../types/errors";

interface CacheEntry {
  data: NSL_CONFIG;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  duration?: string;
  maxSize?: number;
}

export class ConfigCache {
  private store: Map<string, CacheEntry>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.store = new Map();
    this.maxSize = maxSize;
  }

  public set(key: string, data: NSL_CONFIG, options?: CacheOptions): void {
    try {
      this.evictIfNeeded();

      const now = Date.now();
      const duration = this.parseDuration(options?.duration || "1h");

      this.store.set(key, {
        data,
        timestamp: now,
        expiresAt: now + duration,
      });
    } catch (error) {
      throw new WebConfigError(
        "Erreur lors de la mise en cache",
        ErrorCode.CACHE_ERROR,
        error
      );
    }
  }

  public get(key: string): NSL_CONFIG | null {
    const entry = this.store.get(key);

    if (!entry) return null;

    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  public clear(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  public isValid(key: string): boolean {
    const entry = this.store.get(key);
    return entry != null && !this.isExpired(entry);
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private evictIfNeeded(): void {
    if (this.store.size >= this.maxSize) {
      // Supprimer l'entrée la plus ancienne
      const [firstKey] = this.store.keys();
      this.store.delete(firstKey);
    }
  }

  private parseDuration(duration: string): number {
    const units: { [key: string]: number } = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new WebConfigError(
        "Format de durée invalide",
        ErrorCode.CACHE_ERROR,
        { duration }
      );
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }
}
