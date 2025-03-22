import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserSignInDTO {
  username: string;
  password: string;
}

export const USER_SIGN_IN_DTO_JSON_SCHEMA: JSONSchemaType<IUserSignInDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: { type: "string" },
    password: { type: "string" }
  },
  required: ["username", "password"],
  additionalProperties: false
} as const;

export const isValidUserSignInDTO: ValidateFunction<IUserSignInDTO> = AJV.compile(USER_SIGN_IN_DTO_JSON_SCHEMA);
