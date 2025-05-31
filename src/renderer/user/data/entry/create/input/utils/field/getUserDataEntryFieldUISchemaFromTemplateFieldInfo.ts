import { UiSchema } from "@rjsf/utils";
import { LogFunctions } from "electron-log";
import { USER_DATA_TEMPLATE_FIELD_TYPES } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { getUserDataEntryIntegerFieldUISchemaFromTemplateIntegerFieldInfo } from "./implementations/integer/getUserDataEntryIntegerFieldUISchemaFromTemplateIntegerFieldInfo";
import { getUserDataEntryRealFieldUISchemaFromTemplateRealFieldInfo } from "./implementations/real/getUserDataEntryRealFieldUISchemaFromTemplateRealFieldInfo";
import { getUserDataEntryTextFieldUISchemaFromTemplateTextFieldInfo } from "./implementations/text/getUserDataEntryTextFieldUISchemaFromTemplateTextFieldInfo";
import { UserDataEntryField } from "@shared/user/data/entry/field/UserDataEntryField";

export const getUserDataEntryFieldUISchemaFromTemplateFieldInfo = (
  userDataTemplateFieldInfo: UserDataTemplateFieldInfo,
  logger: LogFunctions | null
): UiSchema<UserDataEntryField> => {
  logger?.debug("Getting User Data Entry UI Schema from User Data Template Info.");
  switch (userDataTemplateFieldInfo.type) {
    case USER_DATA_TEMPLATE_FIELD_TYPES.integer:
      return getUserDataEntryIntegerFieldUISchemaFromTemplateIntegerFieldInfo(userDataTemplateFieldInfo, logger) as UiSchema<UserDataEntryField>;
    case USER_DATA_TEMPLATE_FIELD_TYPES.real:
      return getUserDataEntryRealFieldUISchemaFromTemplateRealFieldInfo(userDataTemplateFieldInfo, logger) as UiSchema<UserDataEntryField>;
    case USER_DATA_TEMPLATE_FIELD_TYPES.text:
      return getUserDataEntryTextFieldUISchemaFromTemplateTextFieldInfo(userDataTemplateFieldInfo, logger) as UiSchema<UserDataEntryField>;
  }
};
