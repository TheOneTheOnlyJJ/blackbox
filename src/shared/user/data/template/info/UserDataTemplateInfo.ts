import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA, UserDataTemplateFieldInfo } from "../field/info/UserDataTemplateFieldInfo";

export interface IUserDataTemplateInfo {
  templateId: string;
  storageId: string;
  boxId: string;
  name: string;
  description: string | null;
  fields: UserDataTemplateFieldInfo[];
}

export const USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS = {
  templateId: { title: "ID", format: "uuid" },
  storageId: { title: "Storage", format: "uuid" },
  boxId: { title: "Box", format: "uuid" },
  name: { title: "Name" },
  description: { title: "Description" },
  fields: { title: "Fields" }
} as const;

export const USER_DATA_TEMPLATE_INFO_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    templateId: { type: "string", ...USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.templateId },
    storageId: { type: "string", ...USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.storageId },
    boxId: { type: "string", ...USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.boxId },
    name: { type: "string", ...USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.name },
    description: {
      type: "string",
      ...USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.description,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    fields: { type: "array", items: USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA, minItems: 1, ...USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.fields }
  },
  required: ["templateId", "storageId", "boxId", "name", "description", "fields"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateInfo: ValidateFunction<IUserDataTemplateInfo> = AJV.compile(USER_DATA_TEMPLATE_INFO_JSON_SCHEMA);

export const isValidUserDataTemplateInfoArray = (data: unknown): data is IUserDataTemplateInfo[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataTemplateInfo => {
    return isValidUserDataTemplateInfo(value);
  });
};
