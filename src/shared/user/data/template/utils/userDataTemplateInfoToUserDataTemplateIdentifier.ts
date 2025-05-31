import { LogFunctions } from "electron-log";
import { IUserDataTemplateIdentifier } from "../identifier/UserDataTemplateIdentifier";
import { IUserDataTemplateInfo } from "../info/UserDataTemplateInfo";

export const userDataTemplateInfoToUserDataTemplateIdentifier = (
  userDataTemplateInfo: IUserDataTemplateInfo,
  logger: LogFunctions | null
): IUserDataTemplateIdentifier => {
  logger?.debug("Converting User Data Template Info to User Data Template Identifier.");
  return {
    templateId: userDataTemplateInfo.templateId,
    boxId: userDataTemplateInfo.boxId,
    storageId: userDataTemplateInfo.storageId
  } satisfies IUserDataTemplateIdentifier;
};
