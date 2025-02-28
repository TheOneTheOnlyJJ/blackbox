import { IPublicUserDataStorageConfig } from "@shared/user/data/storage/PublicUserDataStorageConfig";
import { ISecuredUserDataStorageConfig } from "../SecuredUserDataStorageConfig";
import { LogFunctions } from "electron-log";

export const securedUserDataStorageConfigToPublicUserDataStorageConfig = (
  securedUserDataStorageConfig: ISecuredUserDataStorageConfig,
  logger: LogFunctions
): IPublicUserDataStorageConfig => {
  logger.debug(`Converting Secured User Data Storage Config to Public User Data Storage Config.`); // TODO: Make logger optional in all of these
  return {
    storageId: securedUserDataStorageConfig.storageId,
    name: securedUserDataStorageConfig.name,
    type: securedUserDataStorageConfig.backendConfig.type,
    isOpen: false // TODO: Make this work properly & Move this to UserDataStorage class?
  };
};
