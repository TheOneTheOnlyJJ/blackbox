import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "../UserDataStorageVisibilityGroupConfigCreateConstants";

export interface IUserDataStorageVisibilityGroupConfigCreateDTO {
  userId: string;
  name: string;
  password: string;
  description: string | null;
}

export const USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageVisibilityGroupConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string", ...USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.userId },
    name: { type: "string", ...USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    password: { type: "string", ...USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.password },
    description: {
      type: "string",
      ...USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.description,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["userId", "name", "password", "description"],
  additionalProperties: false
} as const;

export const isValidUserDataStorageVisibilityGroupConfigCreateDTO: ValidateFunction<IUserDataStorageVisibilityGroupConfigCreateDTO> = AJV.compile(
  USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_DTO_JSON_SCHEMA
);
