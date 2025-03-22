import { JSONSchemaType, ValidateFunction } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { IUserDataStorageConfigInfo, USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA } from "./UserDataStorageConfigInfo";

export interface IUserDataStorageConfigsInfoChangedDiff {
  removed: string[]; // Storages IDs
  added: IUserDataStorageConfigInfo[];
}

export const USER_DATA_STORAGE_CONFIGS_INFO_CHANGED_DIFF_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigsInfoChangedDiff> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    removed: {
      type: "array",
      title: "Removed",
      items: { type: "string", format: "uuid" }
    },
    added: {
      type: "array",
      title: "Added",
      items: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA
    }
  },
  required: ["removed", "added"],
  additionalProperties: false
} as const;

export const isValidUserDataStorageConfigsInfoChangedDiff: ValidateFunction<IUserDataStorageConfigsInfoChangedDiff> = AJV.compile(
  USER_DATA_STORAGE_CONFIGS_INFO_CHANGED_DIFF_JSON_SCHEMA
);
