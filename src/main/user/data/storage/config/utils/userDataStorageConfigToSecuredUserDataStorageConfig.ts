import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageConfig } from "../SecuredUserDataStorageConfig";
import { IUserDataStorageConfig } from "../UserDataStorageConfig";

export const userDataStorageConfigToSecuredUserDataStorageConfig = (
  userDataStorageConfig: IUserDataStorageConfig,
  logger: LogFunctions | null
): ISecuredUserDataStorageConfig => {
  logger?.debug("Converting User Data Storage Config to Secured User Data Storage Config.");
  return {
    storageId: userDataStorageConfig.storageId,
    userId: userDataStorageConfig.userId,
    visibilityGroupId: userDataStorageConfig.visibilityGroupId,
    name: userDataStorageConfig.name,
    description: userDataStorageConfig.description,
    backendConfig: userDataStorageConfig.backendConfig
  };
};
