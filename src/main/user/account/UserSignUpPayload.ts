import { JSONSchemaType } from "ajv";
import { UUID } from "node:crypto";

export interface IUserSignUpPayload {
  userId: UUID;
  username: string;
  password: string;
}

export const USER_SIGN_UP_PAYLOAD_JSON_SCHEMA: JSONSchemaType<IUserSignUpPayload> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string", format: "uuid" },
    username: { type: "string" },
    password: { type: "string" }
  },
  required: ["userId", "username", "password"],
  additionalProperties: false
} as const;
