export class NHX_CONFIG {
  private static readonly APP_DESCRIPTION = `Un gestionnaire de logs
   puissant et intelligent pour Node.js, avec support pour la coloration syntaxique, 
  le logging dans des fichiers, le chiffrement des logs
  et l'analyse intelligente des patterns.`;

  private static readonly APP_NAME = "NehonixSmartLogger";
  private static readonly APP_VERSION = "1.0.0";
  private static readonly APP_AUTHOR = "NEHONIX";
  private static readonly APP_LICENSE = "MIT";

  static _global_ = {
    _SYS_ENCRYPT_KEY_: "669f7202ceeae5e8916e90535c0b73e0",
    __WEBSOCKET_URL__: "ws://localhost:8087",
  };
  static _app_endpoints_ = {
    __AUTH__: {
      __LOGIN__: "/auth/login",
      __REGISTER__: "/auth/register",
    },
    _MAIN__: {
      __DASHBOARD__: "/dashboard",
      __LOGS__: "/logs",
      __ANALYTICS__: "/analytics",
    },
    __OTHER__: {
      __UNAUTHORIZED__: "/unauthorized",
    },
  };

  static _app_info_ = {
    __NAME__: NHX_CONFIG.APP_NAME,
    __VERSION__: NHX_CONFIG.APP_VERSION,
    __AUTHOR__: NHX_CONFIG.APP_AUTHOR,
    __DESCRIPTION__: NHX_CONFIG.APP_DESCRIPTION,
    __LICENSE__: NHX_CONFIG.APP_LICENSE,
  };
}
