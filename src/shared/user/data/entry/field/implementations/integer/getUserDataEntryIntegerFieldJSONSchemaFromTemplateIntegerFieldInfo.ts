import { UserDataEntryIntegerField } from "@shared/user/data/entry/field/implementations/integer/UserDataEntryIntegerField";
import { IUserDataTemplateIntegerFieldInfo } from "@shared/user/data/template/field/info/implementations/integer/UserDataTemplateIntegerFieldInfo";
import { JSONSchemaType } from "ajv";
import { LogFunctions } from "electron-log";

export const getUserDataEntryIntegerFieldJSONSchemaFromTemplateIntegerFieldInfo = (
  userDataTemplateIntegerFieldInfo: IUserDataTemplateIntegerFieldInfo,
  logger: LogFunctions | null
): JSONSchemaType<UserDataEntryIntegerField> => {
  logger?.debug("Getting User Data Entry Integer Field JSON Schema from User Data Template Integer Field Info.");
  const INTEGER_FIELD_JSON_SCHEMA: JSONSchemaType<UserDataEntryIntegerField> = {
    type: "integer",
    title: userDataTemplateIntegerFieldInfo.name,
    multipleOf: userDataTemplateIntegerFieldInfo.multipleOf ?? undefined,
    default: userDataTemplateIntegerFieldInfo.default ?? undefined
  };
  if (userDataTemplateIntegerFieldInfo.minimum !== null) {
    if (userDataTemplateIntegerFieldInfo.minimum.exclusive) {
      INTEGER_FIELD_JSON_SCHEMA.exclusiveMinimum = userDataTemplateIntegerFieldInfo.minimum.value;
    } else {
      INTEGER_FIELD_JSON_SCHEMA.minimum = userDataTemplateIntegerFieldInfo.minimum.value;
    }
  }
  if (userDataTemplateIntegerFieldInfo.maximum !== null) {
    if (userDataTemplateIntegerFieldInfo.maximum.exclusive) {
      INTEGER_FIELD_JSON_SCHEMA.exclusiveMaximum = userDataTemplateIntegerFieldInfo.maximum.value;
    } else {
      INTEGER_FIELD_JSON_SCHEMA.maximum = userDataTemplateIntegerFieldInfo.maximum.value;
    }
  }
  return INTEGER_FIELD_JSON_SCHEMA;
};
