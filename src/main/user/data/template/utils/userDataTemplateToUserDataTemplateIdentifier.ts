import { LogFunctions } from "electron-log";
import { IUserDataTemplate } from "../UserDataTemplate";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";

export const userDataTemplateToUserDataTemplateIdentifier = (
  userDataTemplate: IUserDataTemplate,
  logger: LogFunctions | null
): IUserDataTemplateIdentifier => {
  logger?.debug("Converting User Data Template to User Data Template Identifier.");
  return {
    templateId: userDataTemplate.templateId,
    storageId: userDataTemplate.storageId,
    boxId: userDataTemplate.boxId
  } satisfies IUserDataTemplateIdentifier;
};
