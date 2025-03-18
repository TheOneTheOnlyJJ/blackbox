import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "../SecuredUserDataStorageVisibilityGroupConfig";
import { IUserDataStorageVisibilityGroupConfig } from "../UserDataStorageVisibilityGroupConfig";
import { randomBytes } from "node:crypto";

export const userDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig = (
  userDataStorageVisibilityGroupConfig: IUserDataStorageVisibilityGroupConfig,
  passwordSaltLengthBytes: number,
  hashPasswordFunction: (password: string, passwordSalt: Buffer) => string,
  logger: LogFunctions | null
): ISecuredUserDataStorageVisibilityGroupConfig => {
  logger?.debug("Converting User Data Storage Visibility Group Config to Secured User Data Storage Visibility Group Config.");
  const PASSWORD_SALT: Buffer = randomBytes(passwordSaltLengthBytes);
  return {
    visibilityGroupId: userDataStorageVisibilityGroupConfig.visibilityGroupId,
    userId: userDataStorageVisibilityGroupConfig.userId,
    name: userDataStorageVisibilityGroupConfig.name,
    securedPassword: {
      hash: hashPasswordFunction(userDataStorageVisibilityGroupConfig.password, PASSWORD_SALT),
      salt: PASSWORD_SALT.toString("base64")
    },
    description: userDataStorageVisibilityGroupConfig.description,
    AESKeySalt: userDataStorageVisibilityGroupConfig.AESKeySalt
  } satisfies ISecuredUserDataStorageVisibilityGroupConfig;
};
