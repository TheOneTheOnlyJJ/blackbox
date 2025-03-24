import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA, UserDataStorageBackendInfo } from "../backend/info/UserDataStorageBackendInfo";

export interface IUserDataStorageInfo {
  storageId: string;
  name: string;
  description: string | null;
  visibilityGroupId: string | null;
  backend: UserDataStorageBackendInfo;
}

export const USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS = {
  storageId: { title: "ID", format: "uuid" },
  name: { title: "Name" },
  description: { title: "Description" },
  visibilityGroupId: { title: "Visibility Group", format: "uuid" },
  backend: { title: "Backend" }
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
    visibilityGroupId: {
      type: "string",
      ...USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    backend: { ...USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS, ...USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA }
  },
  required: ["storageId", "name", "description", "visibilityGroupId", "backend"],
  additionalProperties: false
} as const;

export const isValidUserDataStorageInfo: ValidateFunction<IUserDataStorageInfo> = AJV.compile(USER_DATA_STORAGE_INFO_JSON_SCHEMA);

export const isValidUserDataStorageInfoArray = (data: unknown): data is IUserDataStorageInfo[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataStorageInfo => {
    return isValidUserDataStorageInfoArray(value);
  });
};
