import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataBoxIdentifier {
  boxId: string;
  storageId: string;
}

export const USER_DATA_BOX_IDENTIFIER_JSON_SCHEMA: JSONSchemaType<IUserDataBoxIdentifier> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", format: "uuid" },
    boxId: { type: "string", format: "uuid" }
  },
  required: ["storageId", "boxId"],
  additionalProperties: false
} as const;

export const isValidUserDataBoxIdentifier: ValidateFunction<IUserDataBoxIdentifier> =
  AJV.compile<IUserDataBoxIdentifier>(USER_DATA_BOX_IDENTIFIER_JSON_SCHEMA);

export const isValidUserDataBoxIdentifierArray = (data: unknown): data is IUserDataBoxIdentifier[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataBoxIdentifier => {
    return isValidUserDataBoxIdentifier(value);
  });
};
