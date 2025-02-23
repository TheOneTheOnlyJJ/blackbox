import { UUID } from "node:crypto";
import { USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA, UserDataStorageBackendConfig } from "../backend/config/UserDataStorageBackendConfig";
import { ISecuredPassword, SECURED_PASSWORD_JSON_SCHEMA } from "@main/utils/encryption/SecuredPassword";
import { JSONSchemaType } from "ajv";

export interface ISecuredUserDataStorageConfig {
  storageId: UUID;
  name: string;
  securedVisibilityPassword?: ISecuredPassword;
  backendConfig: UserDataStorageBackendConfig;
}

export const SECURED_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<ISecuredUserDataStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", format: "uuid" },
    name: { type: "string" },
    securedVisibilityPassword: { ...SECURED_PASSWORD_JSON_SCHEMA, nullable: true },
    backendConfig: USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA
  },
  required: ["storageId", "name", "backendConfig"],
  additionalProperties: false
} as const;
