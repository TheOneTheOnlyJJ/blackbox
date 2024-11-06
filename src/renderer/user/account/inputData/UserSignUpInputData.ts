import { JSONSchemaType } from "ajv";
import { IUserSignUpData } from "@shared/user/account/UserSignUpData";
import { USER_SIGN_UP_DATA_CONSTRAINTS } from "@shared/user/account/UserSignUpDataConstraints";

export interface IUserSignUpInputData extends IUserSignUpData {
  confirmPassword: string;
}

export const USER_SIGN_UP_INPUT_DATA_JSON_SCHEMA: JSONSchemaType<IUserSignUpInputData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: {
      type: "string",
      minLength: USER_SIGN_UP_DATA_CONSTRAINTS.username.minLength,
      maxLength: USER_SIGN_UP_DATA_CONSTRAINTS.username.maxLength,
      pattern: USER_SIGN_UP_DATA_CONSTRAINTS.username.pattern
    },
    password: {
      type: "string",
      minLength: USER_SIGN_UP_DATA_CONSTRAINTS.password.minLength
    },
    confirmPassword: {
      type: "string",
      minLength: USER_SIGN_UP_DATA_CONSTRAINTS.password.minLength
    }
  },
  required: ["username", "password", "confirmPassword"],
  additionalProperties: false
} as const;
