import { JSONSchemaType } from "ajv";
import { IUserSignUpData } from "@shared/user/account/UserSignUpData";
import { USER_SIGN_UP_DATA_CONSTANTS } from "@shared/user/account/UserSignUpDataConstants";

export interface IUserSignUpInputData extends IUserSignUpData {
  confirmPassword: string;
}

export const USER_SIGN_UP_INPUT_DATA_JSON_SCHEMA: JSONSchemaType<IUserSignUpInputData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: {
      type: "string",
      minLength: USER_SIGN_UP_DATA_CONSTANTS.username.minLength,
      maxLength: USER_SIGN_UP_DATA_CONSTANTS.username.maxLength,
      pattern: USER_SIGN_UP_DATA_CONSTANTS.username.pattern
    },
    password: {
      type: "string",
      minLength: USER_SIGN_UP_DATA_CONSTANTS.password.minLength
    },
    confirmPassword: {
      type: "string",
      minLength: USER_SIGN_UP_DATA_CONSTANTS.password.minLength
    }
  },
  required: ["username", "password", "confirmPassword"],
  additionalProperties: false
} as const;
