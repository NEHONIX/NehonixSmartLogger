import type { SERVER_LOGGER_PROPS } from "../types/type";

interface LogPattern {
  pattern: RegExp;
  severity: "low" | "medium" | "high";
  category: string;
  suggestion?: string;
}

interface LogInsight {
  timestamp: string;
  pattern: string;
  severity: "low" | "medium" | "high";
  category: string;
  occurrence: number;
  suggestion?: string;
  context?: unknown;
}

interface LogAnomaly {
  type: "high_frequency";
  pattern: string;
  frequency: number;
  category: string;
  severity: "low" | "medium" | "high";
  lastOccurrence: string;
}

export class LogAnalyzer {
  private static instance: LogAnalyzer;
  private patterns: LogPattern[] = [];
  private insights: Map<string, LogInsight> = new Map();
  private errorFrequency: Map<string, number> = new Map();

  // Patterns prédéfinis pour la détection d'erreurs communes
  private defaultPatterns: LogPattern[] = [
    {
      pattern: /ECONNREFUSED|connection refused/i,
      severity: "high",
      category: "network",
      suggestion:
        "Vérifiez que le service distant est bien démarré et accessible",
    },
    {
      pattern: /ETIMEDOUT|timeout/i,
      severity: "medium",
      category: "performance",
      suggestion:
        "Considérez augmenter le délai d'attente ou optimiser la requête",
    },
    {
      pattern: /(out of memory|heap|stack overflow)/i,
      severity: "high",
      category: "memory",
      suggestion:
        "Vérifiez les fuites de mémoire potentielles et optimisez l'utilisation de la mémoire",
    },
    {
      pattern: /(undefined|null|is not a function)/i,
      severity: "high",
      category: "code",
      suggestion:
        "Ajoutez des vérifications de null/undefined et des validations de type",
    },
  ];

  private constructor() {
    this.patterns = [...this.defaultPatterns];
  }

  public static getInstance(): LogAnalyzer {
    if (!LogAnalyzer.instance) {
      LogAnalyzer.instance = new LogAnalyzer();
    }
    return LogAnalyzer.instance;
  }

  /**
   * Ajoute un nouveau pattern de détection
   */
  public addPattern(pattern: LogPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Analyse un message de log
   */
  public analyze(
    message: string,
    timestamp: string,
    context?: unknown
  ): LogInsight[] {
    const insights: LogInsight[] = [];

    this.patterns.forEach((pattern) => {
      if (pattern.pattern.test(message)) {
        const key = `${pattern.category}-${pattern.pattern.toString()}`;
        const currentInsight = this.insights.get(key) || {
          timestamp,
          pattern: pattern.pattern.toString(),
          severity: pattern.severity,
          category: pattern.category,
          occurrence: 0,
          suggestion: pattern.suggestion,
          context,
        };

        currentInsight.occurrence++;
        this.insights.set(key, currentInsight);
        insights.push(currentInsight);

        // Mise à jour de la fréquence des erreurs
        const errorCount = (this.errorFrequency.get(key) || 0) + 1;
        this.errorFrequency.set(key, errorCount);
      }
    });

    return insights;
  }

  /**
   * Génère des suggestions basées sur l'analyse des patterns
   */
  public generateSuggestions(): string[] {
    const suggestions: string[] = [];
    this.insights.forEach((insight, key) => {
      const frequency = this.errorFrequency.get(key) || 0;

      if (frequency > 5) {
        suggestions.push(
          `⚠️ Erreur fréquente détectée (${frequency}x) - ${insight.category}:\n` +
            `   Pattern: ${insight.pattern}\n` +
            `   Sévérité: ${insight.severity}\n` +
            `   Suggestion: ${
              insight.suggestion || "Aucune suggestion disponible"
            }`
        );
      }
    });
    return suggestions;
  }

  /**
   * Détecte les anomalies dans les patterns de log
   */
  public detectAnomalies(): LogAnomaly[] {
    const anomalies: LogAnomaly[] = [];
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    this.insights.forEach((insight, key) => {
      const frequency = this.errorFrequency.get(key) || 0;
      const timestamp = new Date(insight.timestamp).getTime();

      if (now - timestamp < timeWindow && frequency > 10) {
        anomalies.push({
          type: "high_frequency",
          pattern: insight.pattern,
          frequency,
          category: insight.category,
          severity: insight.severity,
          lastOccurrence: insight.timestamp,
        });
      }
    });

    return anomalies;
  }

  /**
   * Réinitialise les analyses
   */
  public reset(): void {
    this.insights.clear();
    this.errorFrequency.clear();
  }
}
