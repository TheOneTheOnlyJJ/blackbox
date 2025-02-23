import { UUID } from "node:crypto";
import { JSONSchemaType } from "ajv";
import { USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA, UserAccountStorageBackendConfig } from "../backend/config/UserAccountStorageBackendConfig";

export interface IUserAccountStorageConfig {
  storageId: UUID;
  name: string;
  backendConfig: UserAccountStorageBackendConfig;
}

export const USER_ACCOUNT_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<IUserAccountStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", format: "uuid" },
    name: { type: "string" },
    backendConfig: USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA
  },
  required: ["storageId", "name", "backendConfig"],
  additionalProperties: false
} as const;
