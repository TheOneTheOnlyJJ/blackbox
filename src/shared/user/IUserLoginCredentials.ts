import { JSONSchemaType } from "ajv/dist/types/json-schema";

export interface IUserLoginCredentials {
  username: string;
  password: string;
}

export const USER_LOGIN_CREDENTIALS_JSON_SCHEMA: JSONSchemaType<IUserLoginCredentials> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: { username: { type: "string" }, password: { type: "string" } },
  required: ["username", "password"],
  additionalProperties: false
};
