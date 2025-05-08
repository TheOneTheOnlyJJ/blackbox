import { LogFunctions } from "electron-log";
import { IUserDataTemplateConfig } from "../UserDataTemplateConfig";
import { ISecuredUserDataTemplateConfig } from "../SecuredUserDataTemplateConfig";
import { UserDataTemplateFieldConfig } from "../../field/config/UserDataTemplateFieldConfig";
import { SecuredUserDataTemplateFieldConfig } from "../../field/config/SecuredUserDataTemplateFieldConfig";
import { userDataTemplateFieldConfigToSecuredUserDataTemplateFieldConfig } from "../../field/config/utils/userDataTemplateFieldConfigToSecuredUserDataTemplateFieldConfig";

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
    description: userDataTemplateConfig.description,
    fields: userDataTemplateConfig.fields.map((userDataTemplateFieldConfig: UserDataTemplateFieldConfig): SecuredUserDataTemplateFieldConfig => {
      return userDataTemplateFieldConfigToSecuredUserDataTemplateFieldConfig(userDataTemplateFieldConfig, logger);
    })
  } satisfies ISecuredUserDataTemplateConfig;
};
