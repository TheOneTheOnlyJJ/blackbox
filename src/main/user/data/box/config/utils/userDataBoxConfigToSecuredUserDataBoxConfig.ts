import { LogFunctions } from "electron-log";
import { ISecuredUserDataBoxConfig } from "../SecuredUserDataBoxConfig";
import { IUserDataBoxConfig } from "../UserDataBoxConfig";

export const userDataBoxConfigToSecuredUserDataBoxConfig = (
  userDataBoxConfig: IUserDataBoxConfig,
  logger: LogFunctions | null
): ISecuredUserDataBoxConfig => {
  logger?.debug("Converting User Data Box Config to Secured User Data Box Config.");
  return {
    boxId: userDataBoxConfig.boxId,
    storageId: userDataBoxConfig.storageId,
    name: userDataBoxConfig.name,
    description: userDataBoxConfig.description
  } satisfies ISecuredUserDataBoxConfig;
};
