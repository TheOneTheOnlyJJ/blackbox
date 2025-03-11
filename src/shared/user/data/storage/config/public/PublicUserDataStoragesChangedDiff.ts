import { JSONSchemaType, ValidateFunction } from "ajv";
import { IPublicUserDataStorageConfig, PUBLIC_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA } from "./PublicUserDataStorageConfig";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IPublicUserDataStoragesChangedDiff {
  deleted: string[]; // UUID of deleted configs
  added: IPublicUserDataStorageConfig[];
}

export const PUBLIC_USER_DATA_STORAGE_CHANGED_DIFF_JSON_SCHEMA: JSONSchemaType<IPublicUserDataStoragesChangedDiff> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    deleted: {
      type: "array",
      title: "Deleted",
      items: { type: "string", format: "uuid" }
    },
    added: {
      type: "array",
      title: "Added",
      items: PUBLIC_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA
    }
  },
  required: ["deleted", "added"],
  additionalProperties: false
} as const;

export const PUBLIC_USER_DATA_STORAGES_CHANGED_DIFF_VALIDATE_FUNCTION: ValidateFunction<IPublicUserDataStoragesChangedDiff> = AJV.compile(
  PUBLIC_USER_DATA_STORAGE_CHANGED_DIFF_JSON_SCHEMA
);
