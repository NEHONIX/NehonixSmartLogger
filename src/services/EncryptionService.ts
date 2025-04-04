import crypto from "crypto";

export class EncryptionService {
  private static instance: EncryptionService;
  private algorithm = "aes-256-cbc";
  /**
   * bah on va utiliser 16 car pour AES, la taille du vecteur d'initialisation est toujours 16
   */
  private ivLength = 16;

  private constructor() {}

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Chiffre un message avec une clé donnée
   * @param message Le message à chiffrer
   * @param key La clé de chiffrement (doit être une clé hexadécimale)
   * @returns Le message chiffré au format: iv:encrypted
   */
  public encrypt(message: string, key: string): string {
    try {
      // Générer un IV aléatoire
      const iv = crypto.randomBytes(this.ivLength);

      // Créer le cipher avec la clé et l'IV
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(key, "hex"),
        iv
      );

      // Chiffrer le message
      let encrypted = cipher.update(message, "utf8", "hex");
      encrypted += cipher.final("hex");

      // Retourner l'IV et le message chiffré
      return `${iv.toString("hex")}:${encrypted}`;
    } catch (error) {
      console.error("Erreur lors du chiffrement:", error);
      return message; // En cas d'erreur, retourner le message original
    }
  }

  /**
   * Déchiffre un message avec une clé donnée
   * @param encryptedMessage Le message chiffré (format: iv:encrypted)
   * @param key La clé de déchiffrement (doit être une clé hexadécimale)
   * @returns Le message déchiffré
   */
  public decrypt(encryptedMessage: string, key: string): string {
    try {
      // Séparer l'IV et le message chiffré
      const [ivHex, encrypted] = encryptedMessage.split(":");

      if (!ivHex || !encrypted) {
        throw new Error("Format de message chiffré invalide");
      }

      const iv = Buffer.from(ivHex, "hex");

      // Créer le decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(key, "hex"),
        iv
      );

      // Déchiffrer le message
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Erreur lors du déchiffrement:", error);
      return encryptedMessage; // En cas d'erreur, retourner le message chiffré
    }
  }

  /**
   * Génère une clé de chiffrement aléatoire
   * @returns Une clé hexadécimale de 32 octets (256 bits)
   */
  public get generateKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Vérifie si une clé est valide pour le chiffrement
   * @param key La clé à vérifier
   * @returns true si la clé est valide
   */
  public isValidKey(key: string): boolean {
    try {
      // La clé doit être une chaîne hexadécimale de 64 caractères (32 octets)
      return /^[0-9a-f]{64}$/i.test(key);
    } catch {
      return false;
    }
  }
}
