import { JSONSchemaType } from "ajv";
import { UUID } from "node:crypto";

export interface IUserDataStorageVisibilityGroupConfig {
  visibilityGroupId: UUID;
  userId: UUID;
  name: string;
  password: string;
  description: string | null;
  AESKeySalt: string;
}

export const USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CONSTANTS = {
  AESKeySalt: {
    lengthBytes: 32
  }
} as const;

export const USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_JSON_SCHEMA: JSONSchemaType<IUserDataStorageVisibilityGroupConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    visibilityGroupId: { type: "string", title: "Visibility Group ID", format: "uuid" },
    userId: { type: "string", title: "User ID", format: "uuid" },
    name: { type: "string", title: "Name" },
    password: { type: "string", title: "Password" },
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
  required: ["visibilityGroupId", "userId", "name", "password", "description", "AESKeySalt"],
  additionalProperties: false
} as const;
