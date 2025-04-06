export class NHX_CONFIG {
  private static readonly APP_DESCRIPTION = `Un gestionnaire de logs
   puissant et intelligent pour Node.js, avec support pour la coloration syntaxique, 
  le logging dans des fichiers, le chiffrement des logs
  et l'analyse intelligente des patterns.`;

  private static readonly APP_NAME = "NehonixSmartLogger";
  private static readonly APP_VERSION = "1.0.0";
  private static readonly APP_AUTHOR = "NEHONIX";
  private static readonly APP_LICENSE = "MIT";

  // Fonction pour obtenir le fingerprint du canvas
  private static async getCanvasFingerprint() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const text = "NEHONIX";
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText(text, 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText(text, 4, 17);
    }

    return canvas.toDataURL();
  }

  // Fonction pour obtenir le fingerprint WebGL
  private static async getWebGLFingerprint() {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    return gl?.getParameter(gl?.VENDOR) + gl?.getParameter(gl?.RENDERER);
  }

  // Fonction pour obtenir le fingerprint audio
  private static async getAudioFingerprint() {
    const audioContext = new (window.AudioContext ||
      (window as any)?.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();

    oscillator.connect(analyser);
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    return Array.from(dataArray).join(",");
  }

  // Fonction pour obtenir la liste des polices
  private static async getFonts() {
    const baseFonts = ["monospace", "sans-serif", "serif"];
    const fontList = [
      "Arial",
      "Verdana",
      "Helvetica",
      "Times New Roman",
      "Courier New",
      "Georgia",
      "Palatino",
      "Garamond",
      "Bookman",
      "Tahoma",
      "Trebuchet MS",
    ];

    const d = document.createElement("div");
    d.style.visibility = "hidden";
    d.style.position = "absolute";
    document.body.appendChild(d);

    const detectedFonts = [];

    for (const font of fontList) {
      let matched = 0;
      for (const baseFont of baseFonts) {
        d.style.fontFamily = `'${font}',${baseFont}`;
        if (d.offsetWidth !== 0) {
          matched++;
        }
      }
      if (matched >= baseFonts.length) {
        detectedFonts.push(font);
      }
    }

    document.body.removeChild(d);
    return detectedFonts;
  }

  // Fonction pour obtenir la liste des plugins
  static async getPlugins() {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins;
  }

  // Fonction principale pour collecter toutes les informations
  private static async collectDeviceInfo() {
    return {
      "sec-ch-ua-color-depth": window.screen.colorDepth.toString(),
      "sec-ch-ua-plugins": (await NHX_CONFIG.getPlugins()).join(","),
      "sec-ch-ua-canvas": await NHX_CONFIG.getCanvasFingerprint(),
      "sec-ch-ua-webgl": await NHX_CONFIG.getWebGLFingerprint(),
      "sec-ch-ua-fonts": (await NHX_CONFIG.getFonts()).join(","),
      "sec-ch-ua-audio": await NHX_CONFIG.getAudioFingerprint(),
    };
  }

  static _global_ = {
    _SYS_ENCRYPT_KEY_: "669f7202ceeae5e8916e90535c0b73e0",
    __WEBSOCKET_URL__: "ws://localhost:8087",
    __GET_SYS_INFO__: NHX_CONFIG.collectDeviceInfo,
  };
  static _app_endpoints_ = {
    __AUTH__: {
      __LOGIN__: "/auth/login",
      __REGISTER__: "/auth/register",
    },
    _MAIN__: {
      __DASHBOARD__: "/app/dashboard",
      __LOGS__: "/app/logs",
      __ANALYTICS__: "/app/analytics",
    },
    __OTHER__: {
      __UNAUTHORIZED__: "/unauthorized",
    },
  };

  static _app_info_ = {
    __NAME__: NHX_CONFIG.APP_NAME,
    __SHORT_NAME: "NSL",
    __VERSION__: NHX_CONFIG.APP_VERSION,
    __AUTHOR__: NHX_CONFIG.APP_AUTHOR,
    __DESCRIPTION__: NHX_CONFIG.APP_DESCRIPTION,
    __LICENSE__: NHX_CONFIG.APP_LICENSE,
  };
}
