import { LogFunctions } from "electron-log";
import { IUserDataTemplate } from "../../UserDataTemplate";
import { ISecuredUserDataTemplateConfig } from "../SecuredUserDataTemplateConfig";

export const securedUserDataTemplateConfigToUserDataTemplate = (
  securedUserDataTemplateConfig: ISecuredUserDataTemplateConfig,
  logger: LogFunctions | null
): IUserDataTemplate => {
  logger?.debug("Converting Secured User Data Template Config to User Data Template.");
  return {
    templateId: securedUserDataTemplateConfig.templateId,
    storageId: securedUserDataTemplateConfig.storageId,
    boxId: securedUserDataTemplateConfig.boxId,
    name: securedUserDataTemplateConfig.name,
    description: securedUserDataTemplateConfig.description
  } satisfies IUserDataTemplate;
};
