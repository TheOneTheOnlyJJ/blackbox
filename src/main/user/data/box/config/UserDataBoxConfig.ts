import { JSONSchemaType } from "ajv";
import { UUID } from "node:crypto";

export interface IUserDataBoxConfig {
  boxId: UUID;
  storageId: UUID;
  name: string;
  description: string | null;
}

export const USER_DATA_BOX_CONFIG_JSON_SCHEMA: JSONSchemaType<IUserDataBoxConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    boxId: { type: "string", format: "uuid" },
    storageId: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1 },
    description: {
      type: "string",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["boxId", "name", "storageId", "description"],
  additionalProperties: false
} as const;
