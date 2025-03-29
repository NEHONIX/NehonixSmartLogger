import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppRoutes } from "./routes";
import "./App.css";
import { useTheme } from "./hooks/useTheme";
export const App: React.FC = () => {
  useTheme();
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
