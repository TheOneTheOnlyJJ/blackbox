import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { JSONSchemaType } from "ajv";
import { LogFunctions } from "electron-log";
import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { UserDataEntryField } from "@shared/user/data/entry/field/UserDataEntryField";
import { getUserDataEntryFieldKey } from "@shared/user/data/entry/utils/getUserDataEntryFieldKey";
import { IUserDataEntryCreateInput } from "../UserDataEntryCreateInput";
import { getUserDataEntryFieldJSONSchemaFromTemplateFieldInfo } from "@shared/user/data/entry/field/utils/getUserDataEntryFieldJSONSchemaFromTemplateFieldInfo";

interface IDataJSONSchemaFieldsObject {
  properties: Record<string, JSONSchemaType<UserDataEntryField>>;
  required: string[];
}

export const getUserDataEntryCreateInputJSONSchemaFromTemplateInfo = (
  userDataTemplateInfo: IUserDataTemplateInfo,
  logger: LogFunctions | null
): JSONSchemaType<IUserDataEntryCreateInput> => {
  logger?.debug("Getting User Data Entry Create Input JSON Schema from User Data Template Info.");
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
      storageId: { type: "string", format: "uuid", const: userDataTemplateInfo.storageId },
      boxId: { type: "string", format: "uuid", const: userDataTemplateInfo.boxId },
      templateId: { type: "string", format: "uuid", const: userDataTemplateInfo.templateId },
      data: {
        type: "object",
        properties: USER_DATA_ENTRY_DATA_JSON_SCHEMA_FIELDS.properties,
        required: USER_DATA_ENTRY_DATA_JSON_SCHEMA_FIELDS.required,
        additionalProperties: false
      }
    },
    required: ["storageId", "boxId", "templateId", "data"],
    additionalProperties: false
  } satisfies JSONSchemaType<IUserDataEntryCreateInput>;
  // TODO: Delete this
  // appLogger.debug(`DATA SCHEMA FIELDS: ${JSON.stringify(SCHEMA, null, 2)}`);
  return SCHEMA;
};
