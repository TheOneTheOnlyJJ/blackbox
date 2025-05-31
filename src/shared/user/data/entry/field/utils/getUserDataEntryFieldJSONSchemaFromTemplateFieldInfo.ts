import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { USER_DATA_TEMPLATE_FIELD_TYPES } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { LogFunctions } from "electron-log";
import { getUserDataEntryIntegerFieldJSONSchemaFromTemplateIntegerFieldInfo } from "@shared/user/data/entry/field/implementations/integer/getUserDataEntryIntegerFieldJSONSchemaFromTemplateIntegerFieldInfo";
import { getUserDataEntryRealFieldJSONSchemaFromTemplateRealFieldInfo } from "@shared/user/data/entry/field/implementations/real/getUserDataEntryRealFieldJSONSchemaFromTemplateRealFieldInfo";
import { getUserDataEntryTextFieldJSONSchemaFromTemplateTextFieldInfo } from "@shared/user/data/entry/field/implementations/text/getUserDataEntryTextFieldJSONSchemaFromTemplateTextFieldInfo";
import { UserDataEntryField } from "@shared/user/data/entry/field/UserDataEntryField";
import { JSONSchemaType } from "ajv";

export const getUserDataEntryFieldJSONSchemaFromTemplateFieldInfo = (
  userDataTemplateFieldInfo: UserDataTemplateFieldInfo,
  logger: LogFunctions | null
): JSONSchemaType<UserDataEntryField> => {
  logger?.debug("Getting User Data Entry Field JSON Schema from User Data Template Field Info.");
  switch (userDataTemplateFieldInfo.type) {
    case USER_DATA_TEMPLATE_FIELD_TYPES.integer:
      return getUserDataEntryIntegerFieldJSONSchemaFromTemplateIntegerFieldInfo(userDataTemplateFieldInfo, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.real:
      return getUserDataEntryRealFieldJSONSchemaFromTemplateRealFieldInfo(userDataTemplateFieldInfo, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.text:
      return getUserDataEntryTextFieldJSONSchemaFromTemplateTextFieldInfo(userDataTemplateFieldInfo, logger);
  }
};
