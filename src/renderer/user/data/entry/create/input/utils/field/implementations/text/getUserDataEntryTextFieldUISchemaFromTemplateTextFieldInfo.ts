import { UiSchema } from "@rjsf/utils";
import { UserDataEntryTextField } from "@shared/user/data/entry/field/implementations/text/UserDataEntryTextField";
import { IUserDataTemplateTextFieldInfo } from "@shared/user/data/template/field/info/implementations/text/UserDataTemplateTextFieldInfo";
import { LogFunctions } from "electron-log";

export const getUserDataEntryTextFieldUISchemaFromTemplateTextFieldInfo = (
  userDataTemplateTextFieldInfo: IUserDataTemplateTextFieldInfo,
  logger: LogFunctions | null
): UiSchema<UserDataEntryTextField> => {
  logger?.debug("Getting User Data Entry Text Field UI Schema from User Data Template Text Field Info.");
  const TEXT_FIELD_UI_SCHEMA: UiSchema<UserDataEntryTextField> = {
    "ui:title": userDataTemplateTextFieldInfo.name
  };
  if (userDataTemplateTextFieldInfo.useTextBox) {
    TEXT_FIELD_UI_SCHEMA["ui:widget"] = "textarea";
  }
  if (userDataTemplateTextFieldInfo.description !== null) {
    TEXT_FIELD_UI_SCHEMA["ui:description"] = userDataTemplateTextFieldInfo.description;
  }
  return TEXT_FIELD_UI_SCHEMA;
};
