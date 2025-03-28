import nehonixLogger from "../logger";

// Log normal avec analyse automatique
nehonixLogger("error", "Connection refused to database");

// Ajouter un pattern personnalisé
nehonixLogger.addAnalysisPattern({
  pattern: /api rate limit exceeded/i,
  severity: "high",
  category: "api",
  suggestion: "Implementez un système de rate limiting côté client",
});

// Réinitialiser l'analyseur si nécessaire
nehonixLogger.resetAnalyzer();
