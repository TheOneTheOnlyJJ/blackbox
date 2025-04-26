import { LogFunctions } from "electron-log";
import { IUserDataTemplate } from "../UserDataTemplate";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";

export const userDataTemplateToUserDataTemplateInfo = (userDataTemplate: IUserDataTemplate, logger: LogFunctions | null): IUserDataTemplateInfo => {
  logger?.debug("Converting User Data Template to User Data Template Info.");
  return {
    templateId: userDataTemplate.templateId,
    storageId: userDataTemplate.storageId,
    boxId: userDataTemplate.boxId,
    name: userDataTemplate.name,
    description: userDataTemplate.description
  } satisfies IUserDataTemplateInfo;
};
