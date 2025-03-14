import { UUID } from "node:crypto";
import { USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA, UserDataStorageBackendConfig } from "../backend/config/UserDataStorageBackendConfig";
import { JSONSchemaType } from "ajv";

export interface IUserDataStorageConfig {
  storageId: UUID;
  userId: UUID;
  visibilityGroupId: UUID | null;
  name: string;
  description: string | null;
  backendConfig: UserDataStorageBackendConfig;
}

export const USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    visibilityGroupId: {
      type: "string",
      format: "uuid",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    name: { type: "string" },
    description: {
      type: "string",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    backendConfig: USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA
  },
  required: ["storageId", "userId", "visibilityGroupId", "name", "description", "backendConfig"],
  additionalProperties: false
} as const;
