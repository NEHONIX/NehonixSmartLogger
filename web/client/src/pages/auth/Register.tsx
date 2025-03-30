import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterCredentials, AuthError, UserTarget } from "../../types/auth";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.scss";
import { NHX_CONFIG } from "../../config/app.conf";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterCredentials>({
    email: "",
    password: "",
    confirmPassword: "",
    target: "dev" as UserTarget,
    name: "",
    entrepriseName: "",
  });
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ modifié
    setErrors((prev) => prev.filter((error) => error.field !== name));
  };

  const validateForm = (): boolean => {
    const newErrors: AuthError[] = [];

    if (!formData.email) {
      newErrors.push({ field: "email", message: "L'email est requis" });
    }

    if (!formData.password) {
      newErrors.push({
        field: "password",
        message: "Le mot de passe est requis",
      });
    }

    if (!formData.confirmPassword) {
      newErrors.push({
        field: "confirmPassword",
        message: "Veuillez confirmer votre mot de passe",
      });
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push({
        field: "confirmPassword",
        message: "Les mots de passe ne correspondent pas",
      });
    }

    if (!formData.target) {
      newErrors.push({
        field: "target",
        message: "Le type d'utilisateur est requis",
      });
    }

    if (formData.target === "entreprise" && !formData.entrepriseName) {
      newErrors.push({
        field: "entrepriseName",
        message: "Le nom de l'entreprise est requis",
      });
    }

    if (!formData.name) {
      newErrors.push({
        field: "name",
        message: "Le nom complet est requis",
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(formData);
      navigate(NHX_CONFIG._app_endpoints_.__AUTH__.__LOGIN__, {
        state: {
          message:
            "Inscription réussie ! Vous pouvez maintenant vous connecter.",
        },
      });
    } catch (error: any) {
      setErrors([
        {
          message: error.response?.data?.message || "Une erreur est survenue",
          field: error.response?.data?.field,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find((error) => error.field === fieldName)?.message;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Inscription</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={getFieldError("email") ? "error" : ""}
              disabled={isLoading}
            />
            {getFieldError("email") && (
              <span className="error-message">{getFieldError("email")}</span>
            )}
          </div>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Nom complet"
              value={formData.name}
              onChange={handleChange}
              className={getFieldError("name") ? "error" : ""}
              disabled={isLoading}
            />
            {getFieldError("name") && (
              <span className="error-message">{getFieldError("name")}</span>
            )}
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              className={getFieldError("password") ? "error" : ""}
              disabled={isLoading}
            />
            {getFieldError("password") && (
              <span className="error-message">{getFieldError("password")}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={getFieldError("confirmPassword") ? "error" : ""}
              disabled={isLoading}
            />
            {getFieldError("confirmPassword") && (
              <span className="error-message">
                {getFieldError("confirmPassword")}
              </span>
            )}
          </div>

          <div className="form-group">
            <select
              name="target"
              value={formData.target}
              onChange={handleChange}
              className={getFieldError("target") ? "error" : ""}
              disabled={isLoading}
              aria-label="Type d'utilisateur"
            >
              <option value="dev">Développeur</option>
              <option value="entreprise">Entreprise</option>
              <option value="guest">Visiteur</option>
            </select>
            {getFieldError("target") && (
              <span className="error-message">{getFieldError("target")}</span>
            )}
          </div>

          {formData.target === "entreprise" && (
            <div className="form-group">
              <input
                type="text"
                name="entrepriseName"
                placeholder="Nom de l'entreprise"
                value={formData.entrepriseName}
                onChange={handleChange}
                className={getFieldError("entrepriseName") ? "error" : ""}
                disabled={isLoading}
              />
              {getFieldError("entrepriseName") && (
                <span className="error-message">
                  {getFieldError("entrepriseName")}
                </span>
              )}
            </div>
          )}

          {errors.map(
            (error, index) =>
              !error.field && (
                <div key={index} className="error-message global-error">
                  {error.message}
                </div>
              )
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>

          <p className="auth-link">
            Déjà inscrit ?{" "}
            <span
              onClick={() =>
                navigate(NHX_CONFIG._app_endpoints_.__AUTH__.__LOGIN__)
              }
              className="link"
            >
              Se connecter
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};
