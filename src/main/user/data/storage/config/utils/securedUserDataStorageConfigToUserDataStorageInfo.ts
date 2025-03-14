import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { ISecuredUserDataStorageConfig } from "../SecuredUserDataStorageConfig";
import { LogFunctions } from "electron-log";

export const securedUserDataStorageConfigToUserDataStorageInfo = (
  securedUserDataStorageConfig: ISecuredUserDataStorageConfig,
  visibilityGroupName: string,
  logger: LogFunctions | null
): IUserDataStorageInfo => {
  logger?.debug("Converting Secured User Data Storage Config to User Data Storage Info.");
  return {
    storageId: securedUserDataStorageConfig.storageId,
    name: securedUserDataStorageConfig.name,
    description: securedUserDataStorageConfig.description,
    visibilityGroupName: visibilityGroupName,
    type: securedUserDataStorageConfig.backendConfig.type,
    isOpen: false // TODO: Make this work properly & Move this to UserDataStorage class?
  };
};
