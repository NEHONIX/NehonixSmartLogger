import React, { ReactNode, useState, createContext, useContext } from "react";

type ActionsContextType = {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export const BtnActionsLoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <ActionsContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </ActionsContext.Provider>
  );
};

export const useActionsLoading = (): ActionsContextType => {
  const context = useContext(ActionsContext);
  if (context === undefined) {
    throw new Error(
      "useActionsLoading must be used within a BtnActionsLoadingProvider"
    );
  }
  return context;
};
