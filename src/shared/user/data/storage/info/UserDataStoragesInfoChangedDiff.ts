import { JSONSchemaType, ValidateFunction } from "ajv";
import { IUserDataStorageInfo, USER_DATA_STORAGE_INFO_JSON_SCHEMA } from "./UserDataStorageInfo";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IUserDataStoragesInfoChangedDiff {
  removed: string[]; // Storages IDs
  added: IUserDataStorageInfo[];
}

export const USER_DATA_STORAGES_INFO_CHANGED_DIFF_JSON_SCHEMA: JSONSchemaType<IUserDataStoragesInfoChangedDiff> = {
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
      items: USER_DATA_STORAGE_INFO_JSON_SCHEMA
    }
  },
  required: ["removed", "added"],
  additionalProperties: false
} as const;

export const isValidUserDataStoragesInfoChangedDiff: ValidateFunction<IUserDataStoragesInfoChangedDiff> = AJV.compile(
  USER_DATA_STORAGES_INFO_CHANGED_DIFF_JSON_SCHEMA
);
