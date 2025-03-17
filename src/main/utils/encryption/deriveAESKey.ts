import { LogFunctions } from "electron-log";
import { scryptSync } from "node:crypto";
import { AES_KEY_LENGTH_BYTES } from "./constants";

export const deriveAESKey = (plainTextPassword: string, salt: Buffer, logger: LogFunctions | null, keyPurposeToLog?: string): Buffer => {
  logger?.debug(`Deriving ${keyPurposeToLog ? keyPurposeToLog + " " : ""}AES key.`);
  return scryptSync(plainTextPassword, salt, AES_KEY_LENGTH_BYTES);
};
