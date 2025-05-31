import { UiSchema } from "@rjsf/utils";
import { UserDataEntryRealField } from "@shared/user/data/entry/field/implementations/real/UserDataEntryRealField";
import { IUserDataTemplateRealFieldInfo } from "@shared/user/data/template/field/info/implementations/real/UserDataTemplateRealFieldInfo";
import { LogFunctions } from "electron-log";

export const getUserDataEntryRealFieldUISchemaFromTemplateRealFieldInfo = (
  userDataTemplateRealFieldInfo: IUserDataTemplateRealFieldInfo,
  logger: LogFunctions | null
): UiSchema<UserDataEntryRealField> => {
  logger?.debug("Getting User Data Entry Real Field UI Schema from User Data Template Real Field Info.");
  const REAL_FIELD_UI_SCHEMA: UiSchema<UserDataEntryRealField> = {
    "ui:title": userDataTemplateRealFieldInfo.name
  };
  if (userDataTemplateRealFieldInfo.description !== null) {
    REAL_FIELD_UI_SCHEMA["ui:description"] = userDataTemplateRealFieldInfo.description;
  }
  return REAL_FIELD_UI_SCHEMA;
};
