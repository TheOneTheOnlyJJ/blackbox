import { JSONSchemaType } from "ajv";
import { NEW_USER_PASSWORD_CONSTRAINTS, NEW_USER_USERNAME_CONSTRAINTS } from "./NewUserConstraints";

export interface IBaseNewUserData {
  username: string;
  password: string;
}

export const BASE_NEW_USER_DATA_JSON_SCHEMA: JSONSchemaType<IBaseNewUserData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: {
      type: "string",
      minLength: NEW_USER_USERNAME_CONSTRAINTS.minLength,
      maxLength: NEW_USER_USERNAME_CONSTRAINTS.maxLength,
      pattern: NEW_USER_USERNAME_CONSTRAINTS.pattern
    },
    password: { type: "string", minLength: NEW_USER_PASSWORD_CONSTRAINTS.minLength }
  },
  required: ["username", "password"],
  additionalProperties: false
};
