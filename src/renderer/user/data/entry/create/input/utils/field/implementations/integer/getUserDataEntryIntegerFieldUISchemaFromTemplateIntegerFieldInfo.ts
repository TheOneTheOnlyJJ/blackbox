import { UiSchema } from "@rjsf/utils";
import { UserDataEntryIntegerField } from "@shared/user/data/entry/field/implementations/integer/UserDataEntryIntegerField";
import { IUserDataTemplateIntegerFieldInfo } from "@shared/user/data/template/field/info/implementations/integer/UserDataTemplateIntegerFieldInfo";
import { LogFunctions } from "electron-log";

export const getUserDataEntryIntegerFieldUISchemaFromTemplateIntegerFieldInfo = (
  userDataTemplateIntegerFieldInfo: IUserDataTemplateIntegerFieldInfo,
  logger: LogFunctions | null
): UiSchema<UserDataEntryIntegerField> => {
  logger?.debug("Getting User Data Entry Integer Field UI Schema from User Data Template Integer Field Info.");
  const INTEGER_FIELD_UI_SCHEMA: UiSchema<UserDataEntryIntegerField> = {
    "ui:title": userDataTemplateIntegerFieldInfo.name
  };
  if (userDataTemplateIntegerFieldInfo.description !== null) {
    INTEGER_FIELD_UI_SCHEMA["ui:description"] = userDataTemplateIntegerFieldInfo.description;
  }
  return INTEGER_FIELD_UI_SCHEMA;
};
