import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_SIGN_UP_JSON_SCHEMA_CONSTANTS } from "./UserSignUpConstants";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IUserSignUpDTO {
  username: string;
  password: string;
}

export const USER_SIGN_UP_DTO_JSON_SCHEMA: JSONSchemaType<IUserSignUpDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: { type: "string", ...USER_SIGN_UP_JSON_SCHEMA_CONSTANTS.username },
    password: { type: "string", ...USER_SIGN_UP_JSON_SCHEMA_CONSTANTS.password }
  },
  required: ["username", "password"],
  additionalProperties: false
} as const;

export const isValidUserSignUpDTO: ValidateFunction<IUserSignUpDTO> = AJV.compile(USER_SIGN_UP_DTO_JSON_SCHEMA);
