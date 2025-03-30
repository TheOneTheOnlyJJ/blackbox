import { ISecuredUserDataStorageConfig } from "../SecuredUserDataStorageConfig";
import { LogFunctions } from "electron-log";
import { userDataStorageBackendConfigToUserDataStorageBackendConfigInfo } from "../../backend/config/utils/userDataStorageBackendConfigToUserDataStorageBackendConfigInfo";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";

export const securedUserDataStorageConfigToUserDataStorageConfigInfo = (
  securedUserDataStorageConfig: ISecuredUserDataStorageConfig,
  isInitialised: boolean,
  logger: LogFunctions | null
): IUserDataStorageConfigInfo => {
  logger?.debug("Converting Secured User Data Storage Config to User Data Storage Config Info.");
  return {
    storageId: securedUserDataStorageConfig.storageId,
    name: securedUserDataStorageConfig.name,
    description: securedUserDataStorageConfig.description,
    visibilityGroupId: securedUserDataStorageConfig.visibilityGroupId,
    backend: userDataStorageBackendConfigToUserDataStorageBackendConfigInfo(securedUserDataStorageConfig.backendConfig, logger),
    isInitialised: isInitialised
  };
};
