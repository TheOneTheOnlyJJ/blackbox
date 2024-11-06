import { JSONSchemaType } from "ajv";
import { IBaseNewUserData } from "./BaseNewUserData";
import { NEW_USER_PASSWORD_CONSTRAINTS, NEW_USER_USERNAME_CONSTRAINTS } from "./NewUserConstraints";

export interface INewUserInputData extends IBaseNewUserData {
  confirmPassword: string;
}

export const NEW_USER_INPUT_DATA_JSON_SCHEMA: JSONSchemaType<INewUserInputData> = {
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
