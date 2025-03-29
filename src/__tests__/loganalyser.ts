import NSMLogger from "../logger";

// Log normal avec analyse automatique
NSMLogger("error", "Connection refused to database");

// Ajouter un pattern personnalisé
NSMLogger.addAnalysisPattern({
  pattern: /api rate limit exceeded/i,
  severity: "high",
  category: "api",
  suggestion: "Implementez un système de rate limiting côté client",
});

// Réinitialiser l'analyseur si nécessaire
NSMLogger.resetAnalyzer();
