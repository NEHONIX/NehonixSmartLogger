import React from "react";
import { NavLink } from "react-router-dom";
import { Gauge, Activity, LineChart } from "lucide-react";
import "./Sidebar.scss";
import { NHX_CONFIG } from "../../../config/app.conf";
export const Sidebar: React.FC = () => {
  return (
    <nav className="sidebar">
      <ul className="sidebar__menu">
        <li>
          <NavLink
            to={NHX_CONFIG._app_endpoints_._MAIN__.__DASHBOARD__}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "active" : ""}`
            }
          >
            <Gauge size={20} />
            <span>Tableau de bord</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`${NHX_CONFIG._app_endpoints_._MAIN__.__LOGS__}?_src=sidebar`}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "active" : ""}`
            }
          >
            <Activity size={20} />
            <span>Logs en direct</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`${NHX_CONFIG._app_endpoints_._MAIN__.__ANALYTICS__}?_src=sidebar`}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "active" : ""}`
            }
          >
            <LineChart size={20} />
            <span>Analyses</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
