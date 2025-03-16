import { JSONSchemaType } from "ajv";

export interface ISignedInUserInfo {
  userId: string;
  username: string;
}

export const SIGNED_IN_USER_INFO_JSON_SCHEMA: JSONSchemaType<ISignedInUserInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string" },
    username: { type: "string" }
  },
  required: ["userId", "username"],
  additionalProperties: false
} as const;
