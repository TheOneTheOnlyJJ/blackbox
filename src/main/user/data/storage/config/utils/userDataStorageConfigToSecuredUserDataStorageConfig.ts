import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageConfig } from "../SecuredUserDataStorageConfig";
import { IUserDataStorageConfig } from "../UserDataStorageConfig";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { randomBytes } from "node:crypto";

export const userDataStorageConfigToSecuredUserDataStorageConfig = (
  userDataStorageConfig: IUserDataStorageConfig,
  visibilityPasswordSaltLength: number,
  hashVisibilityPasswordFunction: (visibilityPassword: string, visibilityPasswordSalt: Buffer) => string,
  logger: LogFunctions
): ISecuredUserDataStorageConfig => {
  logger.debug(`Converting User Data Storage Config to Secured User Data Storage Config.`);
  let securedVisibilityPassword: ISecuredPassword | null;
  if (userDataStorageConfig.visibilityPassword === null) {
    logger.debug("Config does not have a visibility password.");
    securedVisibilityPassword = null;
  } else {
    logger.debug("Config has a visibility password.");
    const VISIBILITY_PASSWORD_SALT: Buffer = randomBytes(visibilityPasswordSaltLength);
    securedVisibilityPassword = {
      hash: hashVisibilityPasswordFunction(userDataStorageConfig.visibilityPassword, VISIBILITY_PASSWORD_SALT),
      salt: VISIBILITY_PASSWORD_SALT.toString("base64")
    };
  }
  return {
    storageId: userDataStorageConfig.storageId,
    userId: userDataStorageConfig.userId,
    name: userDataStorageConfig.name,
    description: userDataStorageConfig.description,
    securedVisibilityPassword: securedVisibilityPassword,
    backendConfig: userDataStorageConfig.backendConfig
  };
};
