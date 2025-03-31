import React, { useEffect } from "react";
import { App, AppConfig } from "../../../types/app";
import "./ConfigModal.scss";
import { NHX_CONFIG } from "../../../config/app.conf";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { X, Copy, Check, FileJson, Code, Terminal } from "lucide-react";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  app: App | undefined;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  app,
}) => {
  const [copyStatus, setCopyStatus] = React.useState<{
    config: boolean;
    code: boolean;
  }>({
    config: false,
    code: false,
  });

  const handleCopyConfig = async (text: string, type: "config" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [type]: false }));
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
  };

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const configString = JSON.stringify(config, null, 2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content config-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="header-content">
            <FileJson className="header-icon" />
            <h2>Configuration - {app?.name || "Nouvelle application"}</h2>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X />
          </button>
        </div>

        <div className="config-content">
          <div className="config-section">
            <div className="section-header">
              <Code className="section-icon" />
              <h3>Configuration {NHX_CONFIG._app_info_.__NAME__}</h3>
            </div>
            <p>
              Copiez cette configuration dans votre fichier{" "}
              <code>nehonix.config.json</code> à la racine de votre projet :
            </p>

            <div className="code-block">
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                {configString}
              </SyntaxHighlighter>
              <button
                className={`copy-button ${copyStatus.config ? "copied" : ""}`}
                onClick={() => handleCopyConfig(configString, "config")}
                title="Copier la configuration"
              >
                {copyStatus.config ? <Check size={16} /> : <Copy size={16} />}
                {copyStatus.config ? "Copié !" : "Copier"}
              </button>
            </div>
          </div>

          <div className="config-section">
            <div className="section-header">
              <Terminal className="section-icon" />
              <h3>Comment utiliser</h3>
            </div>
            <ol>
              <li>
                Créez un fichier <code>nehonix.config.json</code> à la racine de
                votre projet
              </li>
              <li>Collez la configuration ci-dessus dans ce fichier</li>
              <li>Importez et initialisez Nehonix dans votre code :</li>
            </ol>

            <div className="code-block">
              <SyntaxHighlighter
                language="typescript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                {configDoc}
              </SyntaxHighlighter>
              <button
                className={`copy-button ${copyStatus.code ? "copied" : ""}`}
                onClick={() => handleCopyConfig(configDoc, "code")}
                title="Copier le code"
              >
                {copyStatus.code ? <Check size={16} /> : <Copy size={16} />}
                {copyStatus.code ? "Copié !" : "Copier"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const configDoc = `import { NSMLogger } from 'nehonix-logger';
import config from './nehonix.config.json';

// Initialisation du logger
NSMLogger.init(config);

// Exemple d'utilisation
NSMLogger.info("Mon premier log !");
NSMLogger.debug("Debug message");
NSMLogger.warn("Attention !");
NSMLogger.error("Une erreur est survenue");`;
