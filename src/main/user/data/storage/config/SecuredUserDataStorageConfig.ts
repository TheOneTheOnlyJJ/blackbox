import { UUID } from "node:crypto";
import { USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA, UserDataStorageBackendConfig } from "../backend/config/UserDataStorageBackendConfig";
import { ISecuredPassword, SECURED_PASSWORD_JSON_SCHEMA } from "@main/utils/encryption/SecuredPassword";
import { JSONSchemaType } from "ajv";

export interface ISecuredUserDataStorageConfig {
  storageId: UUID;
  name: string;
  description: string | null;
  securedVisibilityPassword: ISecuredPassword | null;
  backendConfig: UserDataStorageBackendConfig;
}

export const SECURED_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<ISecuredUserDataStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", format: "uuid" },
    name: { type: "string" },
    description: {
      type: "string",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    securedVisibilityPassword: {
      ...SECURED_PASSWORD_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    backendConfig: USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA
  },
  required: ["storageId", "name", "description", "securedVisibilityPassword", "backendConfig"],
  additionalProperties: false
} as const;
