import { LogAnalyzer } from "../analytics/LogAnalyzer";

describe("LogAnalyzer", () => {
  let analyzer: LogAnalyzer;

  beforeEach(() => {
    analyzer = LogAnalyzer.getInstance();
    analyzer.reset();
  });

  describe("Pattern Detection", () => {
    it("should detect network errors", () => {
      const timestamp = new Date().toISOString();
      const insights = analyzer.analyze("Error: ECONNREFUSED", timestamp);

      expect(insights).toHaveLength(1);
      expect(insights[0].category).toBe("network");
      expect(insights[0].severity).toBe("high");
    });

    it("should detect timeout issues", () => {
      const timestamp = new Date().toISOString();
      const insights = analyzer.analyze(
        "Operation timed out after 5000ms",
        timestamp
      );

      expect(insights).toHaveLength(1);
      expect(insights[0].category).toBe("performance");
      expect(insights[0].severity).toBe("medium");
    });

    it("should detect memory issues", () => {
      const timestamp = new Date().toISOString();
      const insights = analyzer.analyze("Error: heap out of memory", timestamp);

      expect(insights).toHaveLength(1);
      expect(insights[0].category).toBe("memory");
      expect(insights[0].severity).toBe("high");
    });

    it("should detect code errors", () => {
      const timestamp = new Date().toISOString();
      const insights = analyzer.analyze(
        "TypeError: Cannot read property of undefined",
        timestamp
      );

      expect(insights).toHaveLength(1);
      expect(insights[0].category).toBe("code");
      expect(insights[0].severity).toBe("high");
    });
  });

  describe("Suggestions Generation", () => {
    it("should generate suggestions for frequent errors", () => {
      const timestamp = new Date().toISOString();

      // Simuler plusieurs erreurs du même type
      for (let i = 0; i < 6; i++) {
        analyzer.analyze("Error: ECONNREFUSED", timestamp);
      }

      const suggestions = analyzer.generateSuggestions();
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toContain("Erreur fréquente détectée");
      expect(suggestions[0]).toContain("network");
    });
  });

  describe("Anomaly Detection", () => {
    it("should detect high frequency anomalies", () => {
      const timestamp = new Date().toISOString();

      // Simuler une rafale d'erreurs
      for (let i = 0; i < 11; i++) {
        analyzer.analyze("Error: ECONNREFUSED", timestamp);
      }

      const anomalies = analyzer.detectAnomalies();
      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].type).toBe("high_frequency");
      expect(anomalies[0].frequency).toBeGreaterThan(10);
    });
  });

  describe("Custom Patterns", () => {
    it("should allow adding custom patterns", () => {
      const customPattern = {
        pattern: /custom error/i,
        severity: "high" as const,
        category: "custom",
        suggestion: "Custom suggestion",
      };

      analyzer.addPattern(customPattern);
      const timestamp = new Date().toISOString();
      const insights = analyzer.analyze("Custom error occurred", timestamp);

      expect(insights).toHaveLength(1);
      expect(insights[0].category).toBe("custom");
      expect(insights[0].suggestion).toBe("Custom suggestion");
    });
  });
});
