import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import { useTheme } from "./hooks/useTheme";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FecthAppsProvider } from "./hooks/fetchAppsContext";

export const App: React.FC = () => {
  useTheme();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastContainer />
        <AuthProvider>
          <FecthAppsProvider>
            <AppRoutes />
          </FecthAppsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
