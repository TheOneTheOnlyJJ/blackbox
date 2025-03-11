import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IPublicUserDataStorageConfig {
  storageId: string;
  name: string;
  type: string; // TODO: Add backendConfig and a new type to represent it, with nice titles
  isOpen: boolean;
}

export const PUBLIC_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<IPublicUserDataStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", title: "Storage ID", format: "uuid" },
    name: { type: "string", title: "Name" },
    type: { type: "string", title: "Type" },
    isOpen: { type: "boolean", title: "Is Open" }
  },
  required: ["storageId", "name", "type", "isOpen"],
  additionalProperties: false
} as const;

export const PUBLIC_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION: ValidateFunction<IPublicUserDataStorageConfig> = AJV.compile(
  PUBLIC_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA
);

export const PUBLIC_USER_DATA_STORAGE_CONFIGS_VALIDATE_FUNCTION: ValidateFunction<IPublicUserDataStorageConfig[]> = AJV.compile({
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  items: PUBLIC_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA
} satisfies JSONSchemaType<IPublicUserDataStorageConfig[]>);
