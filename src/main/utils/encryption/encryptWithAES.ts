import { IV_LENGTH } from "@shared/encryption/constants";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { LogFunctions } from "electron-log";
import { CipherGCM, createCipheriv } from "node:crypto";

const TEXT_ENCODER: TextEncoder = new TextEncoder();

export const encryptWithAES = (data: string, AESKey: Buffer, logger: LogFunctions, dataTypeToLog: string): IEncryptedData => {
  logger.debug(`Encrypting ${dataTypeToLog}.`);

  // Generate IV
  const IV: Uint8Array = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // AES 256 GCM Mode
  const CIPHER: CipherGCM = createCipheriv("aes-256-gcm", AESKey, IV);

  // Encrypt data
  const ENCRYPTED_PAYLOAD: Buffer = Buffer.concat([CIPHER.update(TEXT_ENCODER.encode(data)), CIPHER.final()]);

  // Get the authentication tag
  const AUTH_TAG: Buffer = CIPHER.getAuthTag();

  // Combine encrypted data with authentication tag
  const ENCRYPTED_DATA: Buffer = Buffer.concat([ENCRYPTED_PAYLOAD, AUTH_TAG]);

  return {
    data: ENCRYPTED_DATA,
    iv: IV
  };
};
