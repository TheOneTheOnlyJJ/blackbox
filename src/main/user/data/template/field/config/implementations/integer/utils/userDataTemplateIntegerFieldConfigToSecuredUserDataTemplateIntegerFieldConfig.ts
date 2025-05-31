import { LogFunctions } from "electron-log";
import { IUserDataTemplateIntegerFieldConfig } from "../UserDataTemplateIntegerFieldConfig";
import { ISecuredUserDataTemplateIntegerFieldConfig } from "../SecuredUserDataTemplateIntegerFieldConfig";

export const userDataTemplateIntegerFieldConfigToSecuredUserDataTemplateIntegerFieldConfig = (
  userDataTemplateIntegerFieldConfig: IUserDataTemplateIntegerFieldConfig,
  logger: LogFunctions | null
): ISecuredUserDataTemplateIntegerFieldConfig => {
  logger?.debug("Converting User Data Template Integer Field Config to Secured User Data Template Integer Field Config.");
  return {
    type: userDataTemplateIntegerFieldConfig.type,
    name: userDataTemplateIntegerFieldConfig.name,
    description: userDataTemplateIntegerFieldConfig.description,
    isRequired: userDataTemplateIntegerFieldConfig.isRequired,
    minimum: userDataTemplateIntegerFieldConfig.minimum,
    maximum: userDataTemplateIntegerFieldConfig.maximum,
    multipleOf: userDataTemplateIntegerFieldConfig.multipleOf,
    default: userDataTemplateIntegerFieldConfig.default
  } satisfies ISecuredUserDataTemplateIntegerFieldConfig;
};
