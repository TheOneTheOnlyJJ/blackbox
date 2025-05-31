import { UserDataEntryRealField } from "@shared/user/data/entry/field/implementations/real/UserDataEntryRealField";
import { IUserDataTemplateRealFieldInfo } from "@shared/user/data/template/field/info/implementations/real/UserDataTemplateRealFieldInfo";
import { JSONSchemaType } from "ajv";
import { LogFunctions } from "electron-log";

export const getUserDataEntryRealFieldJSONSchemaFromTemplateRealFieldInfo = (
  userDataTemplateRealFieldInfo: IUserDataTemplateRealFieldInfo,
  logger: LogFunctions | null
): JSONSchemaType<UserDataEntryRealField> => {
  logger?.debug("Getting User Data Entry Real Field JSON Schema from User Data Template Real Field Info.");
  const REAL_FIELD_JSON_SCHEMA: JSONSchemaType<UserDataEntryRealField> = {
    type: "number",
    title: userDataTemplateRealFieldInfo.name,
    multipleOf: userDataTemplateRealFieldInfo.multipleOf ?? undefined,
    default: userDataTemplateRealFieldInfo.default ?? undefined
  };
  if (userDataTemplateRealFieldInfo.minimum !== null) {
    if (userDataTemplateRealFieldInfo.minimum.exclusive) {
      REAL_FIELD_JSON_SCHEMA.exclusiveMinimum = userDataTemplateRealFieldInfo.minimum.value;
    } else {
      REAL_FIELD_JSON_SCHEMA.minimum = userDataTemplateRealFieldInfo.minimum.value;
    }
  }
  if (userDataTemplateRealFieldInfo.maximum !== null) {
    if (userDataTemplateRealFieldInfo.maximum.exclusive) {
      REAL_FIELD_JSON_SCHEMA.exclusiveMaximum = userDataTemplateRealFieldInfo.maximum.value;
    } else {
      REAL_FIELD_JSON_SCHEMA.maximum = userDataTemplateRealFieldInfo.maximum.value;
    }
  }
  return REAL_FIELD_JSON_SCHEMA;
};
