import { LogFunctions } from "electron-log";
import { IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig } from "../PrivateStorageSecuredUserDataStorageVisibilityGroupConfig";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "../SecuredUserDataStorageVisibilityGroupConfig";

export const securedUserDataStorageVisibilityGroupConfigToPrivateStorageSecuredUserDataStorageVisibilityGroupConfig = (
  securedUserDataStorageVisibilityGroupConfig: ISecuredUserDataStorageVisibilityGroupConfig,
  logger: LogFunctions | null
): IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig => {
  logger?.debug("Converting Secured User Data Storage Visibility Group Config to Private Storage Secured User Data Storage Visibility Group Config.");
  return {
    name: securedUserDataStorageVisibilityGroupConfig.name,
    securedPassword: securedUserDataStorageVisibilityGroupConfig.securedPassword,
    description: securedUserDataStorageVisibilityGroupConfig.description,
    AESKeySalt: securedUserDataStorageVisibilityGroupConfig.AESKeySalt
  } satisfies IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig;
};
