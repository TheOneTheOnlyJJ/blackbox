import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IUserDataStorageConfig } from "../UserDataStorageConfig";
import { LogFunctions } from "electron-log";
import { userDataStorageBackendConfigToUserDataStorageBackendConfigInfo } from "../../backend/config/utils/userDataStorageBackendConfigToUserDataStorageBackendConfigInfo";

export const userDataStorageConfigToUserDataStorageConfigInfo = (
  userDataStorageConfig: IUserDataStorageConfig,
  isInitialised: boolean,
  logger: LogFunctions | null
): IUserDataStorageConfigInfo => {
  logger?.debug("Converting User Data Storage Config to User Data Storage Config Info.");
  return {
    storageId: userDataStorageConfig.storageId,
    name: userDataStorageConfig.name,
    description: userDataStorageConfig.description,
    visibilityGroupId: userDataStorageConfig.visibilityGroupId,
    backend: userDataStorageBackendConfigToUserDataStorageBackendConfigInfo(userDataStorageConfig.backendConfig, logger),
    isInitialised: isInitialised
  } satisfies IUserDataStorageConfigInfo;
};
