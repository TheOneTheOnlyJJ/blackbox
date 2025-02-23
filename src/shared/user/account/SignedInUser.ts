import { JSONSchemaType } from "ajv";

export interface ISignedInUser {
  userId: string;
  username: string;
}

export const SIGNED_IN_USER_JSON_SCHEMA: JSONSchemaType<ISignedInUser> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string" },
    username: { type: "string" }
  },
  required: ["userId", "username"],
  additionalProperties: false
} as const;
