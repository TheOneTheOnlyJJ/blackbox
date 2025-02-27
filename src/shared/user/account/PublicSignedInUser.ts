import { JSONSchemaType } from "ajv";

export interface IPublicSignedInUser {
  userId: string;
  username: string;
}

export const PUBLIC_SIGNED_IN_USER_JSON_SCHEMA: JSONSchemaType<IPublicSignedInUser> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string" },
    username: { type: "string" }
  },
  required: ["userId", "username"],
  additionalProperties: false
} as const;
