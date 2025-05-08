import { LogFunctions } from "electron-log";
import { IUserDataTemplate } from "../UserDataTemplate";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { UserDataTemplateField } from "../field/UserDataTemplateField";
import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { userDataTemplateFieldToUserDataTemplateFieldInfo } from "../field/utils/userDataTemplateFieldToUserDataTemplateFieldInfo";

export const userDataTemplateToUserDataTemplateInfo = (userDataTemplate: IUserDataTemplate, logger: LogFunctions | null): IUserDataTemplateInfo => {
  logger?.debug("Converting User Data Template to User Data Template Info.");
  return {
    templateId: userDataTemplate.templateId,
    storageId: userDataTemplate.storageId,
    boxId: userDataTemplate.boxId,
    name: userDataTemplate.name,
    description: userDataTemplate.description,
    fields: userDataTemplate.fields.map((userDataTemplateField: UserDataTemplateField): UserDataTemplateFieldInfo => {
      return userDataTemplateFieldToUserDataTemplateFieldInfo(userDataTemplateField, logger);
    })
  } satisfies IUserDataTemplateInfo;
};
