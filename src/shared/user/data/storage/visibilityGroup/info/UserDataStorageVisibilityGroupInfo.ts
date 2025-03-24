import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataStorageVisibilityGroupInfo {
  visibilityGroupId: string;
  name: string;
  description: string | null;
}

export const USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS = {
  visibilityGroupId: { title: "ID", format: "uuid" },
  name: { title: "Name" },
  description: { title: "Description" }
} as const;

export const USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageVisibilityGroupInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    visibilityGroupId: { type: "string", ...USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId },
    name: { type: "string", ...USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.name },
    description: {
      type: "string",
      ...USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.description,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["visibilityGroupId", "name", "description"],
  additionalProperties: false
} as const;

export const isValidUserDataStorageVisibilityGroupInfo: ValidateFunction<IUserDataStorageVisibilityGroupInfo> = AJV.compile(
  USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA
);

export const isValidUserDataStorageVisibilityGroupInfoArray = (data: unknown): data is IUserDataStorageVisibilityGroupInfo[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataStorageVisibilityGroupInfo => {
    return isValidUserDataStorageVisibilityGroupInfo(value);
  });
};
