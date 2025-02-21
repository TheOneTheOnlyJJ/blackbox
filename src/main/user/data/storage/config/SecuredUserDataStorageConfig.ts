import { UUID } from "node:crypto";
import { USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA, UserDataStorageBackendConfig } from "../backend/config/UserDataStorageBackendConfig";
import { ISecuredPasswordData, SECURED_PASSWORD_DATA_JSON_SCHEMA } from "@main/utils/encryption/SecuredPasswordData";
import { JSONSchemaType } from "ajv";

export interface ISecuredUserDataStorageConfig {
  configId: UUID;
  name: string;
  securedVisibilityPassword?: ISecuredPasswordData;
  backendConfig: UserDataStorageBackendConfig;
}

export const SECURED_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<ISecuredUserDataStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    configId: {
      type: "string",
      format: "uuid"
    },
    name: {
      type: "string"
    },
    securedVisibilityPassword: {
      ...SECURED_PASSWORD_DATA_JSON_SCHEMA,
      nullable: true
    },
    backendConfig: USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA
  },
  required: ["configId", "name", "backendConfig"],
  additionalProperties: false
} as const;
