import React from "react";
import "./ErrorDisplay.scss";

interface ErrorDisplayProps {
  type: "AUTH_ERR" | "WS_ERR" | "APP_ERR" | "FETCH_ERR" | "UNKNOWN_ERR";
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  type,
  message,
  onRetry,
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case "AUTH_ERR":
        return "🔒";
      case "WS_ERR":
        return "🔌";
      case "APP_ERR":
        return "⚠️";
      case "FETCH_ERR":
        return "🌐";

      default:
        return "❌";
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case "AUTH_ERR":
        return "Authentication error";
      case "WS_ERR":
        return "Connection error";
      case "APP_ERR":
        return "Application error";
      case "FETCH_ERR":
        return "Fetch error";
      default:
        return "Unknown error";
    }
  };

  return (
    <div className="error-display">
      <div className="error-display__content">
        <div className="error-display__icon">{getErrorIcon()}</div>
        <h2 className="error-display__title">{getErrorTitle()}</h2>
        <p className="error-display__message">{message}</p>
        {onRetry && (
          <button className="error-display__retry-btn" onClick={onRetry}>
            <span className="error-display__retry-icon">↺</span>
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
