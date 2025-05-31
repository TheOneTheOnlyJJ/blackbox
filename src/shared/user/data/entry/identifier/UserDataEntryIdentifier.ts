import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataEntryIdentifier {
  entryId: string;
  storageId: string;
  boxId: string;
  templateId: string;
}

export const USER_DATA_ENTRY_IDENTIFIER_JSON_SCHEMA: JSONSchemaType<IUserDataEntryIdentifier> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    entryId: { type: "string", format: "uuid" },
    storageId: { type: "string", format: "uuid" },
    boxId: { type: "string", format: "uuid" },
    templateId: { type: "string", format: "uuid" }
  },
  required: ["entryId", "storageId", "boxId", "templateId"],
  additionalProperties: false
} as const;

export const isValidUserDataEntryIdentifier: ValidateFunction<IUserDataEntryIdentifier> = AJV.compile<IUserDataEntryIdentifier>(
  USER_DATA_ENTRY_IDENTIFIER_JSON_SCHEMA
);

export const isValidUserDataEntryIdentifierArray = (data: unknown): data is IUserDataEntryIdentifier[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataEntryIdentifier => {
    return isValidUserDataEntryIdentifier(value);
  });
};
