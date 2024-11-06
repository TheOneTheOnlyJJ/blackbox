import { JSONSchemaType } from "ajv/dist/types/json-schema";

export interface IUserSignInCredentials {
  username: string;
  password: string;
}

export const USER_SIGN_IN_CREDENTIALS_JSON_SCHEMA: JSONSchemaType<IUserSignInCredentials> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: { username: { title: "Username", type: "string" }, password: { title: "Password", type: "string" } },
  required: ["username", "password"],
  additionalProperties: false
};
