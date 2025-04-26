import { JSONSchemaType } from "ajv";
import { UUID } from "node:crypto";

export interface ISecuredUserDataTemplateConfig {
  templateId: UUID;
  storageId: UUID;
  boxId: UUID;
  name: string;
  description: string | null;
}

export const SECURED_USER_DATA_TEMPLATE_CONFIG_JSON_SCHEMA: JSONSchemaType<ISecuredUserDataTemplateConfig> = {
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
