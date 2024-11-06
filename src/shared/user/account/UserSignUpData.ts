import { JSONSchemaType } from "ajv";
import { USER_SIGN_UP_DATA_CONSTRAINTS } from "./UserSignUpDataConstraints";

export interface IUserSignUpData {
  username: string;
  password: string;
}

export const USER_SIGN_UP_DATA_JSON_SCHEMA: JSONSchemaType<IUserSignUpData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: {
      type: "string",
      minLength: USER_SIGN_UP_DATA_CONSTRAINTS.username.minLength,
      maxLength: USER_SIGN_UP_DATA_CONSTRAINTS.username.maxLength,
      pattern: USER_SIGN_UP_DATA_CONSTRAINTS.username.pattern
    },
    password: { type: "string", minLength: USER_SIGN_UP_DATA_CONSTRAINTS.password.minLength }
  },
  required: ["username", "password"],
  additionalProperties: false
} as const;
