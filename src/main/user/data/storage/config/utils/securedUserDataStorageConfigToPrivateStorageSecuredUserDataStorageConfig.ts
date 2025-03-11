import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageConfig } from "../SecuredUserDataStorageConfig";
import { IPrivateStorageSecuredUserDataStorageConfig } from "../PrivateStorageSecuredUserDataStorageConfig";

export const securedUserDataStorageConfigToPrivateStorageSecuredUserDataStorageConfig = (
  securedUserDataStorageConfig: ISecuredUserDataStorageConfig,
  logger: LogFunctions | null
): IPrivateStorageSecuredUserDataStorageConfig => {
  logger?.debug(`Converting Secured User Data Storage Config to Private Storage Secured User Data Storage Config.`);
  return {
    name: securedUserDataStorageConfig.name,
    description: securedUserDataStorageConfig.description,
    securedVisibilityPassword: securedUserDataStorageConfig.securedVisibilityPassword,
    backendConfig: securedUserDataStorageConfig.backendConfig
  };
};
