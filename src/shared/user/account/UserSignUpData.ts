import { JSONSchemaType } from "ajv";
import { USER_SIGN_UP_DATA_CONSTANTS } from "./UserSignUpDataConstants";

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
      minLength: USER_SIGN_UP_DATA_CONSTANTS.username.minLength,
      maxLength: USER_SIGN_UP_DATA_CONSTANTS.username.maxLength,
      pattern: USER_SIGN_UP_DATA_CONSTANTS.username.pattern
    },
    password: { type: "string", minLength: USER_SIGN_UP_DATA_CONSTANTS.password.minLength }
  },
  required: ["username", "password"],
  additionalProperties: false
} as const;
