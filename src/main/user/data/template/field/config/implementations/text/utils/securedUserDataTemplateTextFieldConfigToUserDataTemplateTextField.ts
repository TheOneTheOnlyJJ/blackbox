import { LogFunctions } from "electron-log";
import { IUserDataTemplateTextField } from "../../../../implementations/text/UserDataTemplateTextField";
import { ISecuredUserDataTemplateTextFieldConfig } from "../SecuredUserDataTemplateTextFieldConfig";

export const securedUserDataTemplateTextFieldConfigToUserDataTemplateTextField = (
  securedUserDataTemplateTextFieldConfig: ISecuredUserDataTemplateTextFieldConfig,
  logger: LogFunctions | null
): IUserDataTemplateTextField => {
  logger?.debug("Converting Secured User Data Template Real Field Config to User Data Template Real Field.");
  return {
    type: securedUserDataTemplateTextFieldConfig.type,
    name: securedUserDataTemplateTextFieldConfig.name,
    description: securedUserDataTemplateTextFieldConfig.description,
    isRequired: securedUserDataTemplateTextFieldConfig.isRequired,
    useTextBox: securedUserDataTemplateTextFieldConfig.useTextBox,
    default: securedUserDataTemplateTextFieldConfig.default
  } satisfies IUserDataTemplateTextField;
};
