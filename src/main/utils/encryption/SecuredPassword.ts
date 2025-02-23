import { JSONSchemaType } from "ajv";

export interface ISecuredPassword {
  hash: string;
  salt: string;
}

export const SECURED_PASSWORD_JSON_SCHEMA: JSONSchemaType<ISecuredPassword> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    hash: {
      type: "string",
      contentEncoding: "base64"
    },
    salt: {
      type: "string",
      contentEncoding: "base64"
    }
  },
  required: ["hash", "salt"],
  additionalProperties: false
} as const;
