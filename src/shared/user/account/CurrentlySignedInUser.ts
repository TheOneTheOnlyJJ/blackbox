import { JSONSchemaType } from "ajv";

export interface ICurrentlySignedInUser {
  userId: string;
  username: string;
}

export const CURRENTLY_SIGNED_IN_USER_JSON_SCHEMA: JSONSchemaType<ICurrentlySignedInUser> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string" },
    username: { type: "string" }
  },
  required: ["userId", "username"],
  additionalProperties: false
} as const;
