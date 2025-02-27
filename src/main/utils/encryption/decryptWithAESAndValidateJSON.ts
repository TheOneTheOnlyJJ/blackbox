import { ValidateFunction } from "ajv";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { createDecipheriv, DecipherGCM } from "node:crypto";
import { LogFunctions } from "electron-log";
import { TAG_LENGTH } from "@shared/encryption/constants";

const DECODER: TextDecoder = new TextDecoder();

export const decryptWithAESAndValidateJSON = <T>(
  encryptedData: IEncryptedData,
  JSONValidator: ValidateFunction<T>,
  AESKey: Buffer,
  logger: LogFunctions,
  dataTypeToLog: string
): T => {
  logger.debug(`Decrypting ${dataTypeToLog}.`);

  const ENCRYPTED_DATA: Buffer = Buffer.from(encryptedData.data);

  // Check if the encrypted data length is sufficient to contain the tag
  if (ENCRYPTED_DATA.length < TAG_LENGTH) {
    throw new Error(`Encrypted data is too short to contain a valid ${TAG_LENGTH.toString()}-byte authentication tag`);
  }

  // Extract the authentication tag from the end of the encrypted data
  const AUTH_TAG: Buffer = Buffer.from(ENCRYPTED_DATA.buffer, ENCRYPTED_DATA.byteOffset + ENCRYPTED_DATA.length - TAG_LENGTH, TAG_LENGTH);

  // Extract the actual encrypted data (excluding the tag)
  const ENCRYPTED_DATA_PAYLOAD: Buffer = Buffer.from(ENCRYPTED_DATA.buffer, ENCRYPTED_DATA.byteOffset, ENCRYPTED_DATA.length - TAG_LENGTH);

  // Create a decipher instance for AES-GCM
  const DECIPHER: DecipherGCM = createDecipheriv("aes-256-gcm", AESKey, encryptedData.iv);

  // Set the authentication tag
  DECIPHER.setAuthTag(AUTH_TAG);

  // Decrypt the data
  const DECRYPTED_DATA_PAYLOAD: Buffer = Buffer.concat([DECIPHER.update(ENCRYPTED_DATA_PAYLOAD), DECIPHER.final()]);

  // Decode the decrypted data
  const DECRYPTED_DATA_TEXT: string = DECODER.decode(DECRYPTED_DATA_PAYLOAD);

  // Parse the decrypted JSON string into an object
  const DECRYPTED_DATA_OBJECT: unknown = JSON.parse(DECRYPTED_DATA_TEXT);

  // Validate
  if (JSONValidator(DECRYPTED_DATA_OBJECT)) {
    return DECRYPTED_DATA_OBJECT satisfies T;
  } else {
    throw new Error("Decrypted object is not valid");
  }
};
