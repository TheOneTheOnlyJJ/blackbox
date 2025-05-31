import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { JSONSchemaType } from "ajv";
import { LogFunctions } from "electron-log";
import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { UserDataEntryField } from "@shared/user/data/entry/field/UserDataEntryField";
import { getUserDataEntryFieldKey } from "@shared/user/data/entry/utils/getUserDataEntryFieldKey";
import { getUserDataEntryFieldJSONSchemaFromTemplateFieldInfo } from "@shared/user/data/entry/field/utils/getUserDataEntryFieldJSONSchemaFromTemplateFieldInfo";
import { IUserDataEntry } from "../UserDataEntry";

interface IDataJSONSchemaFieldsObject {
  properties: Record<string, JSONSchemaType<UserDataEntryField>>;
  required: string[];
}

export const getUserDataEntryJSONSchemaFromTemplateInfo = (
  userDataTemplateInfo: IUserDataTemplateInfo,
  logger: LogFunctions | null
): JSONSchemaType<IUserDataEntry> => {
  logger?.debug("Getting User Data Entry JSON Schema from User Data Template Info.");
  const USER_DATA_ENTRY_DATA_JSON_SCHEMA_FIELDS: IDataJSONSchemaFieldsObject = userDataTemplateInfo.fields.reduce(
    (acc: IDataJSONSchemaFieldsObject, fieldInfo: UserDataTemplateFieldInfo, index: number): IDataJSONSchemaFieldsObject => {
      const FIELD_KEY = getUserDataEntryFieldKey(index);
      acc.properties[FIELD_KEY] = getUserDataEntryFieldJSONSchemaFromTemplateFieldInfo(fieldInfo, logger);
      if (fieldInfo.isRequired) {
        acc.required.push(FIELD_KEY);
      }
      return acc;
    },
    { properties: {}, required: [] } satisfies IDataJSONSchemaFieldsObject
  );
  const SCHEMA = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      entryId: { type: "string", format: "uuid" },
      storageId: { type: "string", format: "uuid" },
      boxId: { type: "string", format: "uuid" },
      templateId: { type: "string", format: "uuid" },
      data: {
        type: "object",
        properties: USER_DATA_ENTRY_DATA_JSON_SCHEMA_FIELDS.properties,
        required: USER_DATA_ENTRY_DATA_JSON_SCHEMA_FIELDS.required,
        additionalProperties: false
      }
    },
    required: ["storageId", "boxId", "templateId", "data"],
    additionalProperties: false
  } satisfies JSONSchemaType<IUserDataEntry>;
  return SCHEMA;
};
