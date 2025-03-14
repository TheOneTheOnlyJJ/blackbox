import { LogFunctions } from "electron-log";
import { IPrivateStorageSecuredUserDataStorageVisibilityGroup } from "../PrivateStorageSecuredUserDataStorageVisibilityGroup";
import { ISecuredUserDataStorageVisibilityGroup } from "../SecuredUserDataStorageVisibilityGroup";

export const securedUserDataStorageVisibilityGroupToPrivateStorageSecuredUserDataStorageVisibilityGroup = (
  securedUserDataStorageVisibilityGroup: ISecuredUserDataStorageVisibilityGroup,
  logger: LogFunctions | null
): IPrivateStorageSecuredUserDataStorageVisibilityGroup => {
  logger?.debug("Converting Secured User Data Storage Visibility Group to Private Storage Secured User Data Storage Visibility Group.");
  return {
    name: securedUserDataStorageVisibilityGroup.name,
    securedPassword: securedUserDataStorageVisibilityGroup.securedPassword,
    description: securedUserDataStorageVisibilityGroup.description,
    AESKeySalt: securedUserDataStorageVisibilityGroup.AESKeySalt
  } satisfies IPrivateStorageSecuredUserDataStorageVisibilityGroup;
};
