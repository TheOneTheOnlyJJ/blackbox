import { LogFunctions } from "electron-log";
import { scryptSync } from "node:crypto";

export const hashPassword = (plainTextPassword: string, salt: Buffer, logger: LogFunctions | null, passwordPurposeToLog?: string): Buffer => {
  logger?.debug(`Hashing ${passwordPurposeToLog ? passwordPurposeToLog + " " : ""}password.`);
  // TODO: Change scrypt to argon2 once it becomes available
  return scryptSync(plainTextPassword, salt, 64);
};
