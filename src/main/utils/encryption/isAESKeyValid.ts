import { LogFunctions } from "electron-log";
import { randomBytes, createCipheriv, createDecipheriv, CipherGCM, DecipherGCM } from "node:crypto";

export const isAESKeyValid = (AESKey: Buffer, logger: LogFunctions | null, keyPurposeToLog?: string): boolean => {
  logger?.debug(`Validating ${keyPurposeToLog !== undefined ? `${keyPurposeToLog} ` : ""}AES key.`);
  try {
    const TEST_DATA = "Test Data";
    const IV: Buffer = randomBytes(12); // AES-GCM requires a 12-byte IV

    // Create cipher and encrypt the test data
    const CIPHER: CipherGCM = createCipheriv("aes-256-gcm", AESKey, IV);
    const ENCRYPTED: Buffer = Buffer.concat([CIPHER.update(TEST_DATA, "utf8"), CIPHER.final()]);
    const TAG: Buffer = CIPHER.getAuthTag();

    // Create decipher and decrypt the encrypted data
    const DECIPHER: DecipherGCM = createDecipheriv("aes-256-gcm", AESKey, IV);
    DECIPHER.setAuthTag(TAG);
    const DECRYPTED: Buffer = Buffer.concat([DECIPHER.update(ENCRYPTED), DECIPHER.final()]);

    // Check if decrypted data matches the original test data
    return DECRYPTED.toString("utf8") === TEST_DATA;
  } catch (err: unknown) {
    const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
    logger?.error(`Invalid AES key: ${ERROR_MESSAGE}!`);
    return false;
  }
};
