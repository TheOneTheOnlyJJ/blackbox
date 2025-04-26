import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { UUID } from "node:crypto";

export interface IUserDataTemplate {
  templateId: UUID;
  storageId: UUID;
  boxId: UUID;
  name: string;
  description: string | null;
}

export const USER_DATA_TEMPLATE_JSON_SCHEMA: JSONSchemaType<IUserDataTemplate> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    templateId: { type: "string", format: "uuid" },
    storageId: { type: "string", format: "uuid" },
    boxId: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1 },
    description: {
      type: "string",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["templateId", "storageId", "boxId", "name", "description"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplate: ValidateFunction<IUserDataTemplate> = AJV.compile<IUserDataTemplate>(USER_DATA_TEMPLATE_JSON_SCHEMA);

export const isValidUserDataTemplateArray = (data: unknown): data is IUserDataTemplate[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataTemplate => {
    return isValidUserDataTemplate(value);
  });
};
