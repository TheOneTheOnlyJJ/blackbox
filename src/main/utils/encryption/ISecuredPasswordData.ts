import { JSONSchemaType } from "ajv";

export interface ISecuredPasswordData {
  hash: string;
  salt: string;
}

export const SECURED_PASSWORD_DATA_JSON_SCHEMA: JSONSchemaType<ISecuredPasswordData> = {
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
