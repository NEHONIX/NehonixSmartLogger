import React from "react";
import { Header } from "../Header/Header";
import { Sidebar } from "../Sidebar/Sidebar";
import "./Layout.scss";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <div className="layout__content">
        <Sidebar />
        <main className="layout__main">{children}</main>
      </div>
    </div>
  );
};
