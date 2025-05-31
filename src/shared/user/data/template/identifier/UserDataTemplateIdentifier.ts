import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataTemplateIdentifier {
  templateId: string;
  boxId: string;
  storageId: string;
}

// export type UserDataTemplateIdentifierWithoutStorageId = Omit<IUserDataTemplateIdentifier, "storageId">;

export const USER_DATA_TEMPLATE_IDENTIFIER_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateIdentifier> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    templateId: { type: "string", format: "uuid" },
    storageId: { type: "string", format: "uuid" },
    boxId: { type: "string", format: "uuid" }
  },
  required: ["templateId", "storageId", "boxId"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateIdentifier: ValidateFunction<IUserDataTemplateIdentifier> = AJV.compile<IUserDataTemplateIdentifier>(
  USER_DATA_TEMPLATE_IDENTIFIER_JSON_SCHEMA
);

export const isValidUserDataTemplateIdentifierArray = (data: unknown): data is IUserDataTemplateIdentifier[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataTemplateIdentifier => {
    return isValidUserDataTemplateIdentifier(value);
  });
};
