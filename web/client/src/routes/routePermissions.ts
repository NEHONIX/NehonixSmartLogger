import { NHX_CONFIG } from "../config/app.conf";
import { UserTarget } from "../types/auth";

export const routePermissions: Record<string, UserTarget[]> = {
  [NHX_CONFIG._app_endpoints_._MAIN__.__LOGS__]: ["dev", "entreprise"],
};
