/**
 * Interface définissant les propriétés pour la journalisation du serveur.
 * Cette interface permet de configurer le comportement du logger, y compris le mode de journalisation,
 * le type de message à enregistrer et l'intervalle de regroupement des messages.
 */
export interface SERVER_LOGGER_PROPS {
  /**
   * Options de mode de journalisation.
   * Permet de spécifier si le logging est activé et le nom du log.
   */
  logMode?: {
    /**
     * # enable
     *  Indique si le mode de journalisation est activé
     * Permet d'activer le mode "écriture du log" dans un fichier spécifique
     *
     */
    enable?: boolean;
    /** # name
     *  Nom du log pour identifier le fichier de sortie
     */
    name?: string;
    /**
     * # saved_message
     * Permet de controler le méssage "SAVED LOG" quand les logs sont enrégistrées dans les fichiers
     * par défaut "enable"
     */
    saved_message?: "disable" | "enable";
    /**
     * # display_log
     * permet de voir si on doit afficher ou non les logs
     * par défaut true
     */
    display_log?: boolean;
    /**
     * # cryptMode
     * Mode cryptographique (soit, crypter les données du fichier: log ou ceux de la console)
     */
    crypt?: {
      /**
       * # CRYPT_DATAS
       * @property {CRYPT_DATAS} - Cryptage des données du fichier (les logs du fichier) ● disable
       */
      CRYPT_DATAS?: {
        /**
         * # lockStatus
         * @property {lockStatus} - Permet d'activer le mode sécurité  ● disable
         */
        lockStatus: "disable" | "enable";
        /**
         * # key
         * @property {key} - C'est la clé utilisée pour le chiffrement et déchiffrement ● SERVER.CONFIG
         */
        key?: string;
        /**
         * # Iv
         * @property {iv} - C'est le buffet utilisé pour le chiffrement ● SERVER.CONFIG
         */
        iv?: Buffer;
      };
      /**
       * # CRYPT_DATAS
       * @property {CRYPT_LOGS} - Cryptage des données du terminal (des logs du terminal) ● false
       */
      CRYPT_LOGS?: {
        /**
         * # isLocked
         * @property {isLocked} - Permet d'activer le mode sécurité  ● false
         */
        isLocked: boolean;
        /**
         * # key
         * @property {key} - C'est la clé utilisée pour le chiffrement et déchiffrement ● SERVER.CONFIG
         */
        key?: string;
        /**
         * # Iv
         * @property {iv} - C'est le buffet utilisé pour le chiffrement ● SERVER.CONFIG
         */
        iv?: Buffer;
      };
    };
  };

  /**
   * Type ou message à enregistrer dans le log.
   * Peut être un type prédéfini ou un message personnalisé.
   */
  typeOrMessage?: "error" | "log" | "info" | "warn" | string;

  /**
   * Intervalle de temps en millisecondes pour le regroupement des messages.
   * Permet de regrouper plusieurs messages dans un même enregistrement si l'intervalle est respecté.
   */
  groupInterval?: number; // Intervalle en millisecondes pour regrouper les messages
}
