import React, { useState } from "react";
import { appApi, listAppsProps } from "../../../services/appApi";
import { CreateAppResponse, CreateAppConfig } from "../../../types/app";
import { AdvancedConfigModal } from "../AdvancedConfigModal/AdvancedConfigModal";
import "./CreateAppModal.scss";
import { defaultAppConfig } from "../AdvancedConfigModal/defaultAppConfig";

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response: CreateAppResponse) => void;
  fetchApps: (listAppsProps: listAppsProps) => Promise<void>;
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  fetchApps,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);
  const [config, setConfig] = useState<CreateAppConfig>(defaultAppConfig);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Le nom de l'application est requis");
      return;
    }

    setIsLoading(true);
    try {
      const response = await appApi.createApp({
        name,
        description,
        config,
      });
      onSuccess(response);
      await fetchApps({ opt: { useCache: false } });
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = (newConfig: CreateAppConfig) => {
    setConfig(newConfig);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Créer une nouvelle application</h2>
            <button
              className="close-button"
              onClick={onClose}
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="app-form">
            <div className="form-group">
              <label htmlFor="name">Nom de l'application *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon Application"
                disabled={isLoading}
                className={error && !name ? "error" : ""}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de votre application (optionnel)"
                disabled={isLoading}
              />
            </div>

            <div className="form-section">
              <button
                type="button"
                className="toggle-config"
                onClick={() => setShowAdvancedConfig(true)}
              >
                Afficher la configuration avancée
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? "Création..." : "Créer l'application"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AdvancedConfigModal
        isOpen={showAdvancedConfig}
        onClose={() => setShowAdvancedConfig(false)}
        onSave={handleSaveConfig}
        initialConfig={config}
      />
    </>
  );
};
