export const importPattern: ImportPattern = {
  "@_web": {
    mode: "off",
    url: null,
  },
  "@_local": {
    mode: "off",
    url: null,
  },
};
type ImportPattern = {
  [key in ImportKeys]: {
    mode: "on" | "off";
    url: string | null;
  };
};
export type ImportKeys = "@_web" | "@_local";
