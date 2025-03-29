import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Vérifie d'abord la préférence sauvegardée
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme;
    }

    // Sinon, vérifie la préférence système
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  });

  useEffect(() => {
    // Met à jour l'attribut data-theme sur le root
    document.documentElement.setAttribute("data-theme", theme);
    // Sauvegarde la préférence
    localStorage.setItem("theme", theme);

    // Force le rafraîchissement des styles
    document.body.style.backgroundColor = "var(--background-primary)";
    document.body.style.color = "var(--text-primary)";
  }, [theme]);

  // Écoute les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      return newTheme;
    });
  };

  return { theme, toggleTheme };
};
