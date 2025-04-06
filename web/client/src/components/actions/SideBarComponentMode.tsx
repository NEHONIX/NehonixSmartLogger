import { useNavigate } from "react-router-dom";
import { AppList } from "../apps/AppList/AppList";
import { CSSProperties } from "react";

interface SideBarComponentModeProps {
  message: string;
  navigateTo: string;
}

export default function SideBarComponentMode({
  message,
  navigateTo,
}: SideBarComponentModeProps) {
  const navigate = useNavigate();

  return (
    <div style={styles.analyticSideBarMode} className="analytic-sidebar-mode">
      <p>{message}</p>
      <AppList
        showAppActions={false}
        onDetailsClick={(appId) => navigate(`${navigateTo}/${appId}`)}
      />
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  analyticSideBarMode: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#f0f0f0",
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
  },
};
