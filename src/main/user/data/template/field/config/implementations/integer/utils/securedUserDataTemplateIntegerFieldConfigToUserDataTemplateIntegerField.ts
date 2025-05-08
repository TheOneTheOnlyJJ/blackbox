import { LogFunctions } from "electron-log";
import { IUserDataTemplateIntegerField } from "../../../../implementations/integer/UserDataTemplateIntegerField";
import { ISecuredUserDataTemplateIntegerFieldConfig } from "../SecuredUserDataTemplateIntegerFieldConfig";

export const securedUserDataTemplateIntegerFieldConfigToUserDataTemplateIntegerField = (
  securedUserDataTemplateIntegerFieldConfig: ISecuredUserDataTemplateIntegerFieldConfig,
  logger: LogFunctions | null
): IUserDataTemplateIntegerField => {
  logger?.debug("Converting Secured User Data Template Integer Field Config to User Data Template Integer Field.");
  return {
    type: securedUserDataTemplateIntegerFieldConfig.type,
    name: securedUserDataTemplateIntegerFieldConfig.name,
    description: securedUserDataTemplateIntegerFieldConfig.description,
    minimum: securedUserDataTemplateIntegerFieldConfig.minimum,
    maximum: securedUserDataTemplateIntegerFieldConfig.maximum,
    multipleOf: securedUserDataTemplateIntegerFieldConfig.multipleOf,
    default: securedUserDataTemplateIntegerFieldConfig.default
  } satisfies IUserDataTemplateIntegerField;
};
