import { LogFunctions } from "electron-log";
import { ISecuredUserDataTemplateRealFieldConfig } from "../SecuredUserDataTemplateRealFieldConfig";
import { IUserDataTemplateRealField } from "../../../../implementations/real/UserDataTemplateRealField";

export const securedUserDataTemplateRealFieldConfigToUserDataTemplateRealField = (
  securedUserDataTemplateRealFieldConfig: ISecuredUserDataTemplateRealFieldConfig,
  logger: LogFunctions | null
): IUserDataTemplateRealField => {
  logger?.debug("Converting Secured User Data Template Real Field Config to User Data Template Real Field.");
  return {
    type: securedUserDataTemplateRealFieldConfig.type,
    name: securedUserDataTemplateRealFieldConfig.name,
    description: securedUserDataTemplateRealFieldConfig.description,
    isRequired: securedUserDataTemplateRealFieldConfig.isRequired,
    minimum: securedUserDataTemplateRealFieldConfig.minimum,
    maximum: securedUserDataTemplateRealFieldConfig.maximum,
    multipleOf: securedUserDataTemplateRealFieldConfig.multipleOf,
    default: securedUserDataTemplateRealFieldConfig.default
  } satisfies IUserDataTemplateRealField;
};
