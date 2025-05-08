import { LogFunctions } from "electron-log";
import { IUserDataTemplateTextFieldConfig } from "../UserDataTemplateTextFieldConfig";
import { ISecuredUserDataTemplateTextFieldConfig } from "../SecuredUserDataTemplateTextFieldConfig";

export const userDataTemplateTextFieldConfigToSecuredUserDataTemplateTextFieldConfig = (
  userDataTemplateTextFieldConfig: IUserDataTemplateTextFieldConfig,
  logger: LogFunctions | null
): ISecuredUserDataTemplateTextFieldConfig => {
  logger?.debug("Converting User Data Template Text Field Config to Secured User Data Template Text Field Config.");
  return {
    type: userDataTemplateTextFieldConfig.type,
    name: userDataTemplateTextFieldConfig.name,
    description: userDataTemplateTextFieldConfig.description,
    useTextBox: userDataTemplateTextFieldConfig.useTextBox,
    default: userDataTemplateTextFieldConfig.default
  } satisfies ISecuredUserDataTemplateTextFieldConfig;
};
