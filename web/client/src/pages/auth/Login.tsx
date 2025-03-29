import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginCredentials, AuthError } from "../../types/auth";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.scss";
import { NHX_CONFIG } from "../../config/app.conf";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    const state = location.state as { message?: string; from?: Location };
    if (state?.message) {
      setSuccessMessage(state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      const state = location.state as { from?: Location };
      navigate(state?.from?.pathname || NHX_CONFIG._app_endpoints_._MAIN__.__DASHBOARD__);
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
        <h2>Connexion</h2>
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
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

          {errors.map(
            (error, index) =>
              !error.field && (
                <div key={index} className="error-message global-error">
                  {error.message}
                </div>
              )
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>

          <p className="auth-link">
            Pas encore inscrit ?{" "}
            <span
              onClick={() =>
                navigate(NHX_CONFIG._app_endpoints_.__AUTH__.__REGISTER__)
              }
              className="link"
            >
              S'inscrire
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};
