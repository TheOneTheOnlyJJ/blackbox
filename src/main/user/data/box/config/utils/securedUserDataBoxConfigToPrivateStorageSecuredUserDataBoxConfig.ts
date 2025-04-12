import { LogFunctions } from "electron-log";
import { IPrivateStorageSecuredUserDataBoxConfig } from "../PrivateStorageSecuredUserDataBoxConfig";
import { ISecuredUserDataBoxConfig } from "../SecuredUserDataBoxConfig";

export const securedUserDataBoxConfigToPrivateStorageSecuredUserDataBoxConfig = (
  securedUserDataBoxConfig: ISecuredUserDataBoxConfig,
  logger: LogFunctions | null
): IPrivateStorageSecuredUserDataBoxConfig => {
  logger?.debug("Converting Secured User Data Box Config to Private Storage Secured User Data Box Config.");
  return {
    name: securedUserDataBoxConfig.name,
    description: securedUserDataBoxConfig.description
  } satisfies IPrivateStorageSecuredUserDataBoxConfig;
};
