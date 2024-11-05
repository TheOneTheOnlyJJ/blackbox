import { JSONSchemaType } from "ajv";
import { IBaseNewUserData } from "./IBaseNewUserData";
import { NEW_USER_PASSWORD_CONSTRAINTS, NEW_USER_USERNAME_CONSTRAINTS } from "./NewUserConstraints";

// TODO: Rename this
export interface IFormNewUserData extends IBaseNewUserData {
  confirmPassword: string;
}

export const FORM_NEW_USER_DATA_JSON_SCHEMA: JSONSchemaType<IFormNewUserData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: {
      title: "Username",
      description: `Unique to every user. Maximum ${NEW_USER_USERNAME_CONSTRAINTS.maxLength.toString()} characters`,
      type: "string",
      minLength: NEW_USER_USERNAME_CONSTRAINTS.minLength,
      maxLength: NEW_USER_USERNAME_CONSTRAINTS.maxLength,
      pattern: NEW_USER_USERNAME_CONSTRAINTS.pattern
    },
    password: {
      title: "Password",
      description: `Minimum ${NEW_USER_PASSWORD_CONSTRAINTS.minLength.toString()} characters`,
      type: "string",
      minLength: NEW_USER_PASSWORD_CONSTRAINTS.minLength
    },
    confirmPassword: {
      title: "Confirm Password",
      description: "Must match password",
      type: "string",
      minLength: NEW_USER_PASSWORD_CONSTRAINTS.minLength
    }
  },
  required: ["username", "password", "confirmPassword"],
  additionalProperties: false
};
