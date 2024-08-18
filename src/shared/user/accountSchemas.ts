import { JSONSchemaType } from "ajv";

export interface INewUserRawData {
  username: string;
  password: string;
}

export interface INewUserFormData extends INewUserRawData {
  confirmPassword: string;
}

export const USER_USERNAME_MIN_LENGTH = 1;
export const USER_USERNAME_MAX_LENGTH = 50;

export const USER_PASSWORD_MIN_LENGTH = 6;

export const USER_REGISTER_DATA_JSON_SCHEMA: JSONSchemaType<INewUserRawData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: { type: "string", minLength: USER_USERNAME_MIN_LENGTH, maxLength: USER_USERNAME_MAX_LENGTH },
    password: { type: "string", minLength: USER_PASSWORD_MIN_LENGTH }
  },
  required: ["username", "password"],
  additionalProperties: false
};

export const USER_REGISTER_FORM_DATA_JSON_SCHEMA: JSONSchemaType<INewUserFormData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: {
      title: "Username",
      description: `Unique to every user. Maximum ${USER_USERNAME_MAX_LENGTH.toString()} characters`,
      type: "string",
      minLength: USER_USERNAME_MIN_LENGTH,
      maxLength: USER_USERNAME_MAX_LENGTH
    },
    password: {
      title: "Password",
      description: `Minimum ${USER_PASSWORD_MIN_LENGTH.toString()} characters`,
      type: "string",
      minLength: USER_PASSWORD_MIN_LENGTH
    },
    confirmPassword: {
      title: "Confirm Password",
      description: "Must match password",
      type: "string",
      minLength: USER_PASSWORD_MIN_LENGTH
    }
  },
  required: ["username", "password", "confirmPassword"],
  additionalProperties: false
};
