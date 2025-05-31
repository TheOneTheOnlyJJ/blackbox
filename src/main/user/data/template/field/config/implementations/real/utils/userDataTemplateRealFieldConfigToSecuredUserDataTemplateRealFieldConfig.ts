import { LogFunctions } from "electron-log";
import { IUserDataTemplateRealFieldConfig } from "../UserDataTemplateRealFieldConfig";
import { ISecuredUserDataTemplateRealFieldConfig } from "../SecuredUserDataTemplateRealFieldConfig";

export const userDataTemplateRealFieldConfigToSecuredUserDataTemplateRealFieldConfig = (
  userDataTemplateRealFieldConfig: IUserDataTemplateRealFieldConfig,
  logger: LogFunctions | null
): ISecuredUserDataTemplateRealFieldConfig => {
  logger?.debug("Converting User Data Template Real Field Config to Secured User Data Template Real Field Config.");
  return {
    type: userDataTemplateRealFieldConfig.type,
    name: userDataTemplateRealFieldConfig.name,
    description: userDataTemplateRealFieldConfig.description,
    isRequired: userDataTemplateRealFieldConfig.isRequired,
    minimum: userDataTemplateRealFieldConfig.minimum,
    maximum: userDataTemplateRealFieldConfig.maximum,
    multipleOf: userDataTemplateRealFieldConfig.multipleOf,
    default: userDataTemplateRealFieldConfig.default
  } satisfies ISecuredUserDataTemplateRealFieldConfig;
};
