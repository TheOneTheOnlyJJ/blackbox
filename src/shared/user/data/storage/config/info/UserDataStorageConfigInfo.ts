import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA,
  UserDataStorageBackendConfigInfo
} from "../../backend/config/info/UserDataStorageBackendConfigInfo";

export interface IUserDataStorageConfigInfo {
  storageId: string;
  name: string;
  description: string | null;
  visibilityGroupId: string | null;
  backend: UserDataStorageBackendConfigInfo;
}

export const USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS = {
  storageId: { title: "Storage ID", format: "uuid" },
  name: { title: "Name" },
  description: { title: "Description" },
  visibilityGroupId: { title: "Visibility Group", format: "uuid" }
} as const;

export const USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", ...USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.storageId },
    name: { type: "string", ...USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.name },
    description: {
      type: "string",
      ...USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.description,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    visibilityGroupId: {
      type: "string",
      ...USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    backend: USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA
  },
  required: ["storageId", "name", "description", "visibilityGroupId", "backend"],
  additionalProperties: false
} as const;

export const isValidUserDataStorageConfigInfo: ValidateFunction<IUserDataStorageConfigInfo> = AJV.compile(USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA);

export const isValidUserDataStorageConfigInfoArray: ValidateFunction<IUserDataStorageConfigInfo[]> = AJV.compile({
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  items: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA
} satisfies JSONSchemaType<IUserDataStorageConfigInfo[]>);
