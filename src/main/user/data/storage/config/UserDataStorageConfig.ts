import { UUID } from "node:crypto";
import { USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA, UserDataStorageBackendConfig } from "../backend/config/UserDataStorageBackendConfig";
import { JSONSchemaType } from "ajv";

export interface IUserDataStorageConfig {
  storageId: UUID;
  userId: UUID;
  name: string;
  description?: string;
  visibilityPassword?: string;
  backendConfig: UserDataStorageBackendConfig;
}

export const USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    name: { type: "string" },
    description: { type: "string", nullable: true },
    visibilityPassword: { type: "string", nullable: true },
    backendConfig: USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA
  },
  required: ["storageId", "userId", "name", "backendConfig"],
  additionalProperties: false
} as const;
