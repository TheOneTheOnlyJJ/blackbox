import { USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA, UserDataStorageBackendConfig } from "../backend/config/UserDataStorageBackendConfig";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

// This is the type User Account Storage should accept and return when storing User Data Storage Configs
export interface IPrivateStorageSecuredUserDataStorageConfig {
  name: string;
  description: string | null;
  backendConfig: UserDataStorageBackendConfig;
}

export const PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<IPrivateStorageSecuredUserDataStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string" },
    description: {
      type: "string",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    backendConfig: USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA
  },
  required: ["name", "description", "backendConfig"],
  additionalProperties: false
} as const;

export const PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION: ValidateFunction<IPrivateStorageSecuredUserDataStorageConfig> =
  AJV.compile(PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA);
