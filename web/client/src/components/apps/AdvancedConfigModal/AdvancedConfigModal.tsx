import React, { useState } from "react";
import {
  CreateAppConfig,
  ConsoleConfig,
  PersistenceConfig,
  NetworkConfig,
  PerformanceConfig,
} from "../../../types/app";
import "./AdvancedConfigModal.scss";
import { defaultAppConfig } from "./defaultAppConfig";

interface AdvancedConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: CreateAppConfig) => void;
  initialConfig?: CreateAppConfig;
}

export const AdvancedConfigModal: React.FC<AdvancedConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [config, setConfig] = useState<CreateAppConfig>(
    initialConfig || defaultAppConfig
  );
  const [encryptionKeyError, setEncryptionKeyError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<
    | "general"
    | "console"
    | "persistence"
    | "network"
    | "performance"
    | "encryption"
  >("general");

  const validateEncryptionKey = (key: string): boolean => {
    if (!key) return true; // La clé vide est autorisée (génération automatique)

    // La clé doit être une chaîne hexadécimale de 64 caractères
    if (!/^[0-9a-f]{64}$/i.test(key)) {
      setEncryptionKeyError(
        "La clé doit être une chaîne hexadécimale de 64 caractères (32 octets)"
      );
      return false;
    }

    setEncryptionKeyError("");
    return true;
  };

  const handleEncryptionKeyChange = (key: string) => {
    if (key) {
      validateEncryptionKey(key);
    } else {
      setEncryptionKeyError("");
    }
    updateConfig("encryption", {
      ...config.encryption,
      key,
    });
  };

  const handleSave = () => {
    if (config.encryption.enabled && config.encryption.key) {
      if (!validateEncryptionKey(config.encryption.key)) {
        return;
      }
    }
    onSave(config);
    onClose();
  };

  const updateConfig = <K extends keyof CreateAppConfig>(
    key: K,
    value: CreateAppConfig[K]
  ) => {
    if (key === "console" && value) {
      const consoleConfig = value as Partial<ConsoleConfig>;
      setConfig((prev) => ({
        ...prev,
        console: {
          enabled: true,
          showTimestamp: true,
          showLogLevel: true,
          colorized: true,
          format: "simple",
          ...consoleConfig,
        },
      }));
      return;
    }

    if (key === "persistence" && value) {
      const persistenceConfig = value as Partial<PersistenceConfig>;
      setConfig((prev) => ({
        ...prev,
        persistence: {
          enabled: true,
          maxSize: 100,
          rotationInterval: "daily",
          retentionPeriod: 30,
          compressArchives: true,
          ...persistenceConfig,
        },
      }));
      return;
    }

    if (key === "network" && value) {
      const networkConfig = value as Partial<NetworkConfig>;
      setConfig((prev) => ({
        ...prev,
        network: {
          batchSize: 50,
          retryAttempts: 3,
          retryDelay: 1000,
          timeout: 5000,
          offlineStorage: true,
          maxOfflineSize: 50,
          ...networkConfig,
        },
      }));
      return;
    }

    if (key === "performance" && value) {
      const performanceConfig = value as Partial<PerformanceConfig>;
      setConfig((prev) => ({
        ...prev,
        performance: {
          enabled: true,
          samplingRate: 10,
          maxEventsPerSecond: 100,
          monitorMemory: true,
          monitorCPU: true,
          ...performanceConfig,
        },
      }));
      return;
    }

    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleConsoleChange = (changes: Partial<ConsoleConfig>) => {
    const currentConfig = config.console || {
      enabled: true,
      showTimestamp: true,
      showLogLevel: true,
      colorized: true,
      format: "simple",
    };
    updateConfig("console", { ...currentConfig, ...changes });
  };

  const handlePersistenceChange = (changes: Partial<PersistenceConfig>) => {
    const currentConfig = config.persistence || {
      enabled: true,
      maxSize: 100,
      rotationInterval: "daily",
      retentionPeriod: 30,
      compressArchives: true,
    };
    updateConfig("persistence", { ...currentConfig, ...changes });
  };

  const handleNetworkChange = (changes: Partial<NetworkConfig>) => {
    const currentConfig = config.network || {
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 5000,
      offlineStorage: true,
      maxOfflineSize: 50,
    };
    updateConfig("network", { ...currentConfig, ...changes });
  };

  const handlePerformanceChange = (changes: Partial<PerformanceConfig>) => {
    const currentConfig = config.performance || {
      enabled: true,
      samplingRate: 10,
      maxEventsPerSecond: 100,
      monitorMemory: true,
      monitorCPU: true,
    };
    updateConfig("performance", { ...currentConfig, ...changes });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content advanced-config-modal">
        <div className="modal-header">
          <h2>Configuration avancée</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={activeTab === "general" ? "active" : ""}
            onClick={() => setActiveTab("general")}
          >
            Général
          </button>
          <button
            className={activeTab === "console" ? "active" : ""}
            onClick={() => setActiveTab("console")}
          >
            Console
          </button>
          <button
            className={activeTab === "persistence" ? "active" : ""}
            onClick={() => setActiveTab("persistence")}
          >
            Stockage
          </button>
          <button
            className={activeTab === "network" ? "active" : ""}
            onClick={() => setActiveTab("network")}
          >
            Réseau
          </button>
          <button
            className={activeTab === "performance" ? "active" : ""}
            onClick={() => setActiveTab("performance")}
          >
            Performance
          </button>

          <button
            className={activeTab === "encryption" ? "active" : ""}
            onClick={() => setActiveTab("encryption")}
          >
            Chiffrement
          </button>
        </div>

        <div className="app-form">
          {activeTab === "general" && (
            <div className="tab-content">
              <div className="form-group">
                <label htmlFor="logLevel">Niveau de log</label>
                <select
                  id="logLevel"
                  value={config.logLevel}
                  onChange={(e) =>
                    updateConfig(
                      "logLevel",
                      e.target.value as CreateAppConfig["logLevel"]
                    )
                  }
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.encryption.enabled}
                    onChange={(e) =>
                      updateConfig("encryption", {
                        ...config.encryption,
                        enabled: e.target.checked,
                      })
                    }
                  />
                  Activer le chiffrement des logs
                </label>
              </div>

              {config.encryption.enabled && (
                <div className="form-group encryption-key">
                  <label htmlFor="encryptionKey">
                    Clé de chiffrement (optionnelle)
                  </label>
                  <input
                    type="text"
                    id="encryptionKey"
                    placeholder="Laissez vide pour une clé générée automatiquement"
                    value={config.encryption.key || ""}
                    onChange={(e) =>
                      updateConfig("encryption", {
                        ...config.encryption,
                        key: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "console" && (
            <div className="tab-content">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.console?.enabled}
                    onChange={(e) =>
                      handleConsoleChange({ enabled: e.target.checked })
                    }
                  />
                  Activer les logs console
                </label>
              </div>

              {config.console?.enabled && (
                <>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.console.showTimestamp}
                        onChange={(e) =>
                          handleConsoleChange({
                            showTimestamp: e.target.checked,
                          })
                        }
                      />
                      Afficher l'horodatage
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.console.showLogLevel}
                        onChange={(e) =>
                          handleConsoleChange({
                            showLogLevel: e.target.checked,
                          })
                        }
                      />
                      Afficher le niveau de log
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.console.colorized}
                        onChange={(e) =>
                          handleConsoleChange({ colorized: e.target.checked })
                        }
                      />
                      Colorer les logs
                    </label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="consoleFormat">Format des logs</label>
                    <select
                      id="consoleFormat"
                      value={config.console.format}
                      onChange={(e) =>
                        handleConsoleChange({
                          format: e.target.value as ConsoleConfig["format"],
                        })
                      }
                    >
                      <option value="simple">Simple</option>
                      <option value="detailed">Détaillé</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "persistence" && (
            <div className="tab-content">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.persistence?.enabled}
                    onChange={(e) =>
                      handlePersistenceChange({ enabled: e.target.checked })
                    }
                  />
                  Activer le stockage des logs
                </label>
              </div>

              {config.persistence?.enabled && (
                <>
                  <div className="form-group">
                    <label htmlFor="maxSize">
                      Taille maximale des logs (MB)
                    </label>
                    <input
                      type="number"
                      id="maxSize"
                      min="1"
                      value={config.persistence.maxSize}
                      onChange={(e) =>
                        handlePersistenceChange({
                          maxSize: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rotationInterval">
                      Intervalle de rotation
                    </label>
                    <select
                      id="rotationInterval"
                      value={config.persistence.rotationInterval}
                      onChange={(e) =>
                        handlePersistenceChange({
                          rotationInterval: e.target
                            .value as PersistenceConfig["rotationInterval"],
                        })
                      }
                    >
                      <option value="hourly">Toutes les heures</option>
                      <option value="daily">Tous les jours</option>
                      <option value="weekly">Toutes les semaines</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="retentionPeriod">
                      Période de rétention (jours)
                    </label>
                    <input
                      type="number"
                      id="retentionPeriod"
                      min="1"
                      value={config.persistence.retentionPeriod}
                      onChange={(e) =>
                        handlePersistenceChange({
                          retentionPeriod: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.persistence.compressArchives}
                        onChange={(e) =>
                          handlePersistenceChange({
                            compressArchives: e.target.checked,
                          })
                        }
                      />
                      Compresser les archives
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "network" && (
            <div className="tab-content">
              <div className="form-group">
                <label htmlFor="batchSize">Taille des lots</label>
                <input
                  type="number"
                  id="batchSize"
                  min="1"
                  max="1000"
                  value={config.network?.batchSize}
                  onChange={(e) =>
                    handleNetworkChange({ batchSize: Number(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="retryAttempts">
                  Nombre de tentatives de reconnexion
                </label>
                <input
                  type="number"
                  id="retryAttempts"
                  min="0"
                  max="10"
                  value={config.network?.retryAttempts}
                  onChange={(e) =>
                    handleNetworkChange({
                      retryAttempts: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="retryDelay">
                  Délai entre les tentatives (ms)
                </label>
                <input
                  type="number"
                  id="retryDelay"
                  min="100"
                  step="100"
                  value={config.network?.retryDelay}
                  onChange={(e) =>
                    handleNetworkChange({ retryDelay: Number(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeout">Timeout (ms)</label>
                <input
                  type="number"
                  id="timeout"
                  min="1000"
                  step="1000"
                  value={config.network?.timeout}
                  onChange={(e) =>
                    handleNetworkChange({ timeout: Number(e.target.value) })
                  }
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.network?.offlineStorage}
                    onChange={(e) =>
                      handleNetworkChange({ offlineStorage: e.target.checked })
                    }
                  />
                  Stockage hors ligne
                </label>
              </div>

              {config.network?.offlineStorage && (
                <div className="form-group">
                  <label htmlFor="maxOfflineSize">
                    Taille maximale du stockage hors ligne (MB)
                  </label>
                  <input
                    type="number"
                    id="maxOfflineSize"
                    min="1"
                    value={config.network.maxOfflineSize}
                    onChange={(e) =>
                      handleNetworkChange({
                        maxOfflineSize: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "performance" && (
            <div className="tab-content">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.performance?.enabled}
                    onChange={(e) =>
                      handlePerformanceChange({ enabled: e.target.checked })
                    }
                  />
                  Activer le monitoring des performances
                </label>
              </div>

              {config.performance?.enabled && (
                <>
                  <div className="form-group">
                    <label htmlFor="samplingRate">
                      Taux d'échantillonnage (%)
                    </label>
                    <input
                      type="number"
                      id="samplingRate"
                      min="1"
                      max="100"
                      value={config.performance.samplingRate}
                      onChange={(e) =>
                        handlePerformanceChange({
                          samplingRate: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="maxEventsPerSecond">
                      Événements maximum par seconde
                    </label>
                    <input
                      type="number"
                      id="maxEventsPerSecond"
                      min="1"
                      value={config.performance.maxEventsPerSecond}
                      onChange={(e) =>
                        handlePerformanceChange({
                          maxEventsPerSecond: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.performance.monitorMemory}
                        onChange={(e) =>
                          handlePerformanceChange({
                            monitorMemory: e.target.checked,
                          })
                        }
                      />
                      Monitorer l'utilisation mémoire
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.performance.monitorCPU}
                        onChange={(e) =>
                          handlePerformanceChange({
                            monitorCPU: e.target.checked,
                          })
                        }
                      />
                      Monitorer l'utilisation CPU
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "encryption" && (
            <div className="tab-content">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.encryption.enabled}
                    onChange={(e) =>
                      updateConfig("encryption", {
                        enabled: e.target.checked,
                      })
                    }
                  />
                  Activer le chiffrement des logs
                </label>
                <br />
                <label htmlFor="encryptionKey">
                  Entrez la clé de chiffrement
                </label>
                <input
                  type="text"
                  id="encryptionKey"
                  placeholder="Laissez vide pour une clé générée automatiquement"
                  value={config.encryption.key || ""}
                  onChange={(e) => handleEncryptionKeyChange(e.target.value)}
                  className={encryptionKeyError ? "error" : ""}
                />
                {encryptionKeyError && (
                  <div className="error-message">{encryptionKeyError}</div>
                )}
                <div className="help-text">
                  La clé doit être une chaîne hexadécimale de 64 caractères (32
                  octets). Laissez vide pour une génération automatique
                  sécurisée <span style={{ color: "red" }}>(recommandé)</span>.
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button className="cancel-button" onClick={onClose}>
              Annuler
            </button>
            <button className="submit-button" onClick={handleSave}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
