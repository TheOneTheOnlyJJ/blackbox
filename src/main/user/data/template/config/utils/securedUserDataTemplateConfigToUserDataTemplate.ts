import { LogFunctions } from "electron-log";
import { IUserDataTemplate } from "../../UserDataTemplate";
import { ISecuredUserDataTemplateConfig } from "../SecuredUserDataTemplateConfig";
import { SecuredUserDataTemplateFieldConfig } from "../../field/config/SecuredUserDataTemplateFieldConfig";
import { UserDataTemplateField } from "../../field/UserDataTemplateField";
import { securedUserDataTemplateFieldConfigToUserDataTemplateField } from "../../field/config/utils/securedUserDataTemplateFieldConfigToUserDataTemplateField";

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
    description: securedUserDataTemplateConfig.description,
    fields: securedUserDataTemplateConfig.fields.map(
      (securedUserDataTemplateFieldConfig: SecuredUserDataTemplateFieldConfig): UserDataTemplateField => {
        return securedUserDataTemplateFieldConfigToUserDataTemplateField(securedUserDataTemplateFieldConfig, logger);
      }
    )
  } satisfies IUserDataTemplate;
};
