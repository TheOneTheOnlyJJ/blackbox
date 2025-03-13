import { JSONSchemaType, ValidateFunction } from "ajv";
import { IUserDataStorageInfo, USER_DATA_STORAGE_INFO_JSON_SCHEMA } from "./UserDataStorageInfo";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IUserDataStoragesInfoChangedDiff {
  deleted: string[]; // UUIDs of deleted storages
  added: IUserDataStorageInfo[];
}

export const USER_DATA_STORAGES_INFO_CHANGED_DIFF_JSON_SCHEMA: JSONSchemaType<IUserDataStoragesInfoChangedDiff> = {
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
      items: USER_DATA_STORAGE_INFO_JSON_SCHEMA
    }
  },
  required: ["deleted", "added"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGES_INFO_CHANGED_DIFF_VALIDATE_FUNCTION: ValidateFunction<IUserDataStoragesInfoChangedDiff> = AJV.compile(
  USER_DATA_STORAGES_INFO_CHANGED_DIFF_JSON_SCHEMA
);
