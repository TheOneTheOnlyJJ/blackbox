import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataStorageInfo {
  storageId: string;
  name: string;
  description: string | null;
  visibilityGroupName: string | null;
  type: string; // TODO: Add backendConfig and a new type to represent it, with nice titles
  isOpen: boolean;
}

export const USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS = {
  storageId: { title: "Storage ID", format: "uuid" },
  name: { title: "Name" },
  description: { title: "Description" },
  visibilityGroupName: { title: "Visibility Group" },
  type: { title: "Type" },
  isOpen: { title: "Is Open" }
} as const;

export const USER_DATA_STORAGE_INFO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", ...USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.storageId },
    name: { type: "string", ...USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.name },
    description: {
      type: "string",
      ...USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.description,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    visibilityGroupName: {
      type: "string",
      ...USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupName,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    type: { type: "string", ...USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.type },
    isOpen: { type: "boolean", ...USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.isOpen }
  },
  required: ["storageId", "name", "description", "visibilityGroupName", "type", "isOpen"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGE_INFO_VALIDATE_FUNCTION: ValidateFunction<IUserDataStorageInfo> = AJV.compile(USER_DATA_STORAGE_INFO_JSON_SCHEMA);

export const LIST_OF_USER_DATA_STORAGES_INFO_VALIDATE_FUNCTION: ValidateFunction<IUserDataStorageInfo[]> = AJV.compile({
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  items: USER_DATA_STORAGE_INFO_JSON_SCHEMA
} satisfies JSONSchemaType<IUserDataStorageInfo[]>);
