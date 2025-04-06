import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.scss";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const closeWindow = () => {
    // Essayer plusieurs méthodes pour fermer la fenêtre
    try {
      // Méthode 1: window.close()
      window.close();

      // Méthode 2: window.open('', '_self').close()
      const win = window.open("", "_self");
      if (win) win.close();

      // Méthode 3: window.opener.close()
      if (window.opener) window.opener.close();

      // Si aucune méthode ne fonctionne, afficher un message
      setTimeout(() => {
        alert(
          "Impossible de fermer automatiquement la fenêtre. Veuillez la fermer manuellement."
        );
      }, 500);
    } catch (e) {
      console.error("Erreur lors de la tentative de fermeture:", e);
      alert(
        "Impossible de fermer automatiquement la fenêtre. Veuillez la fermer manuellement."
      );
    }
  };

  return (
    <div className="not-found">
      <div className="not-found__content">
        <div className="not-found__glitch" data-text="404">
          404
        </div>
        <h1 className="not-found__title">Page non trouvée</h1>
        <p className="not-found__message">
          Oups ! La page que vous recherchez semble avoir disparu dans le néant
          numérique.
          <br />
          <span className="not-found__close-link" onClick={closeWindow}>
            Fermer cette fenêtre
          </span>
        </p>
        <div className="not-found__actions">
          <button
            className="not-found__button not-found__button--primary"
            onClick={handleClose}
          >
            ← Retour
          </button>
          <button
            className="not-found__button not-found__button--secondary"
            onClick={() => navigate("/")}
          >
            Accueil
          </button>
        </div>
        <div className="not-found__decoration">
          <div className="not-found__circuit"></div>
          <div className="not-found__circuit"></div>
          <div className="not-found__circuit"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
