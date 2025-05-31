import { LogFunctions } from "electron-log";
import { IUserDataTemplateTextField } from "../UserDataTemplateTextField";
import { IUserDataTemplateTextFieldInfo } from "@shared/user/data/template/field/info/implementations/text/UserDataTemplateTextFieldInfo";

export const userDataTemplateTextFieldToUserDataTemplateTextFieldInfo = (
  userDataTemplateTextField: IUserDataTemplateTextField,
  logger: LogFunctions | null
): IUserDataTemplateTextFieldInfo => {
  logger?.debug("Converting User Data Template Text Field to User Data Template Text Field Info.");
  return {
    type: userDataTemplateTextField.type,
    name: userDataTemplateTextField.name,
    description: userDataTemplateTextField.description,
    isRequired: userDataTemplateTextField.isRequired,
    useTextBox: userDataTemplateTextField.useTextBox,
    default: userDataTemplateTextField.default
  } satisfies IUserDataTemplateTextFieldInfo;
};
