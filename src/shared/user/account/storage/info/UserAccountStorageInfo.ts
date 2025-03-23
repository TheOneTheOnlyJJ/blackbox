import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA, UserAccountStorageBackendInfo } from "../backend/info/UserAccountStorageBackendInfo";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IUserAccountStorageInfo {
  storageId: string;
  name: string;
  backend: UserAccountStorageBackendInfo;
}

export const USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA_CONSTANTS = {
  storageId: { title: "ID", format: "uuid" },
  name: { title: "Name" },
  backend: { title: "Backend" }
} as const;

export const USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA: JSONSchemaType<IUserAccountStorageInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", ...USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.storageId },
    name: { type: "string", ...USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.name },
    backend: { ...USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.backend, ...USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA }
  },
  required: ["storageId", "name", "backend"],
  additionalProperties: false
} as const;

export const isValidUserAccountStorageInfo: ValidateFunction<IUserAccountStorageInfo> = AJV.compile(USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA);

export const isValidUserAccountStorageInfoArray: ValidateFunction<IUserAccountStorageInfo[]> = AJV.compile({
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  items: USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA
} satisfies JSONSchemaType<IUserAccountStorageInfo[]>);
