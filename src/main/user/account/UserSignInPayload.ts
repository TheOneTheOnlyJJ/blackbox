import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserSignInPayload {
  username: string;
  password: string;
}

export const USER_SIGN_IN_PAYLOAD_JSON_SCHEMA: JSONSchemaType<IUserSignInPayload> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: { type: "string" },
    password: { type: "string" }
  },
  required: ["username", "password"],
  additionalProperties: false
} as const;

export const USER_SIGN_IN_PAYLOAD_VALIDATE_FUNCTION: ValidateFunction<IUserSignInPayload> = AJV.compile(USER_SIGN_IN_PAYLOAD_JSON_SCHEMA);
