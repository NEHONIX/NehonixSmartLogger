import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "../components/common/Layout/Layout";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { LiveLogs } from "../pages/LiveLogs/LiveLogs";
import { Analytics } from "../pages/Analytics/Analytics";

export const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live" element={<LiveLogs />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  );
};
