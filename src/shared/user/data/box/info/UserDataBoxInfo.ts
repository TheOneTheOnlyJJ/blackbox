import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataBoxInfo {
  boxId: string;
  storageId: string;
  name: string;
  description: string | null;
}

export const USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS = {
  boxId: { title: "ID", format: "uuid" },
  storageId: { title: "Storage", format: "uuid" },
  name: { title: "Name" },
  description: { title: "Description" }
} as const;

export const USER_DATA_BOX_INFO_JSON_SCHEMA: JSONSchemaType<IUserDataBoxInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    boxId: { type: "string", ...USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS.boxId },
    storageId: { type: "string", ...USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS.storageId },
    name: { type: "string", ...USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS.name },
    description: {
      type: "string",
      ...USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS.description,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["boxId", "storageId", "name", "description"],
  additionalProperties: false
} as const;

export const isValidUserDataBoxInfo: ValidateFunction<IUserDataBoxInfo> = AJV.compile(USER_DATA_BOX_INFO_JSON_SCHEMA);

export const isValidUserDataBoxInfoArray = (data: unknown): data is IUserDataBoxInfo[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataBoxInfo => {
    return isValidUserDataBoxInfo(value);
  });
};
