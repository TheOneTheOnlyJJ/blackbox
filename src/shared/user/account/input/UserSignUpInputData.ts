import { JSONSchemaType } from "ajv";
import { IUserSignUpData } from "@shared/user/account/UserSignUpData";
import { USER_SIGN_UP_DATA_CONSTANTS } from "@shared/user/account/UserSignUpDataConstants";

// TODO: Make this more clear, maybe with DTO
export interface IUserSignUpInputData extends IUserSignUpData {
  confirmPassword: string;
}

export const USER_SIGN_UP_INPUT_DATA_JSON_SCHEMA: JSONSchemaType<IUserSignUpInputData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: {
      type: "string",
      ...USER_SIGN_UP_DATA_CONSTANTS.username
    },
    password: {
      type: "string",
      ...USER_SIGN_UP_DATA_CONSTANTS.password
    },
    confirmPassword: {
      type: "string",
      ...USER_SIGN_UP_DATA_CONSTANTS.password
    }
  },
  required: ["username", "password", "confirmPassword"],
  additionalProperties: false
} as const;
