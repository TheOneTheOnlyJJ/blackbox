import { ISecuredPassword, SECURED_PASSWORD_JSON_SCHEMA } from "@main/utils/encryption/SecuredPassword";
import { JSONSchemaType } from "ajv";
import { UUID } from "node:crypto";

export interface ISecuredUserDataStorageVisibilityGroupConfig {
  visibilityGroupId: UUID;
  userId: UUID;
  name: string;
  securedPassword: ISecuredPassword;
  description: string | null;
  AESKeySalt: string;
}

export const SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_JSON_SCHEMA: JSONSchemaType<ISecuredUserDataStorageVisibilityGroupConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    visibilityGroupId: { type: "string", title: "Visibility Group ID", format: "uuid" },
    userId: { type: "string", title: "User ID", format: "uuid" },
    name: { type: "string", title: "Name" },
    securedPassword: SECURED_PASSWORD_JSON_SCHEMA,
    description: {
      type: "string",
      title: "Description",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    AESKeySalt: {
      type: "string",
      contentEncoding: "base64"
    }
  },
  required: ["visibilityGroupId", "userId", "name", "securedPassword", "description", "AESKeySalt"],
  additionalProperties: false
} as const;
