import { JSONSchemaType, ValidateFunction } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA, IUserDataStorageVisibilityGroupInfo } from "./UserDataStorageVisibilityGroupInfo";

export interface IUserDataStorageVisibilityGroupsInfoChangedDiff {
  removed: string[]; // Visibility group IDs
  added: IUserDataStorageVisibilityGroupInfo[];
}

export const USER_DATA_STORAGES_VISIBILITY_GROUPS_INFO_CHANGED_DIFF_JSON_SCHEMA: JSONSchemaType<IUserDataStorageVisibilityGroupsInfoChangedDiff> = {
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
      items: USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA
    }
  },
  required: ["removed", "added"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGES_VISIBILITY_GROUPS_INFO_CHANGED_DIFF_VALIDATE_FUNCTION: ValidateFunction<IUserDataStorageVisibilityGroupsInfoChangedDiff> =
  AJV.compile(USER_DATA_STORAGES_VISIBILITY_GROUPS_INFO_CHANGED_DIFF_JSON_SCHEMA);
