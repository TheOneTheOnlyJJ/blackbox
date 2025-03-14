import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageVisibilityGroup } from "../SecuredUserDataStorageVisibilityGroup";
import { IUserDataStorageVisibilityGroup } from "../UserDataStorageVisibilityGroup";
import { randomBytes } from "node:crypto";

export const userDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup = (
  userDataStorageVisibilityGroup: IUserDataStorageVisibilityGroup,
  passwordSaltLength: number,
  hashPasswordFunction: (password: string, passwordSalt: Buffer) => string,
  logger: LogFunctions | null
): ISecuredUserDataStorageVisibilityGroup => {
  logger?.debug("Converting User Data Storage Visibility Group to Secured User Data Storage Visibility Group.");
  const PASSWORD_SALT: Buffer = randomBytes(passwordSaltLength);
  return {
    visibilityGroupId: userDataStorageVisibilityGroup.visibilityGroupId,
    userId: userDataStorageVisibilityGroup.userId,
    name: userDataStorageVisibilityGroup.name,
    securedPassword: {
      hash: hashPasswordFunction(userDataStorageVisibilityGroup.password, PASSWORD_SALT),
      salt: PASSWORD_SALT.toString("base64")
    },
    description: userDataStorageVisibilityGroup.description,
    AESKeySalt: userDataStorageVisibilityGroup.AESKeySalt
  } satisfies ISecuredUserDataStorageVisibilityGroup;
};
