import { JSONSchemaType } from "ajv";

export interface IUserSignInData {
  username: string;
  password: string;
}

export const USER_SIGN_IN_DATA_JSON_SCHEMA: JSONSchemaType<IUserSignInData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: { type: "string" },
    password: { type: "string" }
  },
  required: ["username", "password"],
  additionalProperties: false
} as const;
