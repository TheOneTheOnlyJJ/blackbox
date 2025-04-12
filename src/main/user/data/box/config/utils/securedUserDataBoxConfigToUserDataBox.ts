import { LogFunctions } from "electron-log";
import { ISecuredUserDataBoxConfig } from "../SecuredUserDataBoxConfig";
import { IUserDataBox } from "../../UserDataBox";

export const securedUserDataBoxConfigToUserDataBox = (
  securedUserDataBoxConfig: ISecuredUserDataBoxConfig,
  logger: LogFunctions | null
): IUserDataBox => {
  logger?.debug("Converting Secured User Data Box Config to User Data Box.");
  return {
    boxId: securedUserDataBoxConfig.boxId,
    storageId: securedUserDataBoxConfig.storageId,
    name: securedUserDataBoxConfig.name,
    description: securedUserDataBoxConfig.description
  } satisfies IUserDataBox;
};
