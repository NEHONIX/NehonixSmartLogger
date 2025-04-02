import { useState, useEffect } from "react";
import { useWebSocket } from "./useWebSocket";
import { UserAction, commandType } from "../types/app";

interface UseActionsProps {
  appId: string;
  userId: string;
  wsUrl: string;
}

interface ActionsState {
  consoleEnabled: boolean;
  encryptionEnabled: boolean;
}

export const useActions = ({ appId, userId, wsUrl }: UseActionsProps) => {
  const [actions, setActions] = useState<ActionsState>({
    consoleEnabled: true,
    encryptionEnabled: false,
  });

  const { isAuthenticated, sendCommand } = useWebSocket({
    wsUrl,
    appId,
    userId,
    onCommandResponse: (response) => {
      if (response.success && response.data) {
        const { type, data } = response.data;
        switch (type) {
          case "console_toggle":
            setActions((prev) => ({ ...prev, consoleEnabled: data.enabled }));
            break;
          case "encryption_toggle":
            setActions((prev) => ({
              ...prev,
              encryptionEnabled: data.enabled,
            }));
            break;
        }
      }
    },
    // Recevoir les mises à jour en temps réel des actions
    onActionsUpdate: (actions: UserAction[]) => {
      if (actions.length > 0) {
        // On ne prend que la dernière action de chaque type
        const lastActions = actions.reduce(
          (acc, action) => {
            switch (action.data.type) {
              case "console_toggle":
                return { ...acc, consoleEnabled: action.data.data.enabled };
              case "encryption_toggle":
                return { ...acc, encryptionEnabled: action.data.data.enabled };
              default:
                return acc;
            }
          },
          {
            consoleEnabled: true,
            encryptionEnabled: false,
          }
        );
        setActions(lastActions);
      }
    },
  });

  const handleConsoleToggle = () => {
    sendCommand({
      type: "console_toggle",
      data: { enabled: !actions.consoleEnabled },
    });
  };

  const handleEncryptionToggle = () => {
    sendCommand({
      type: "encryption_toggle",
      data: { enabled: !actions.encryptionEnabled },
    });
  };

  return {
    actions,
    isAuthenticated,
    handleConsoleToggle,
    handleEncryptionToggle,
  };
};
