import { LogFunctions } from "electron-log";
import { IUserDataTemplateConfig } from "../UserDataTemplateConfig";
import { ISecuredUserDataTemplateConfig } from "../SecuredUserDataTemplateConfig";

export const userDataTemplateConfigToSecuredUserDataTemplateConfig = (
  userDataTemplateConfig: IUserDataTemplateConfig,
  logger: LogFunctions | null
): ISecuredUserDataTemplateConfig => {
  logger?.debug("Converting User Data Template Config to Secured User Data Template Config.");
  return {
    templateId: userDataTemplateConfig.templateId,
    storageId: userDataTemplateConfig.storageId,
    boxId: userDataTemplateConfig.boxId,
    name: userDataTemplateConfig.name,
    description: userDataTemplateConfig.description
  } satisfies ISecuredUserDataTemplateConfig;
};
