import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "./UserDataStorageConfigCreateConstants";

export interface IUserDataStorageNameAvailabilityRequest {
  name: string;
  visibilityGroupId: string | null;
}

export const USER_DATA_STORAGE_NAME_AVAILABILITY_REQUEST_JSON_SCHEMA: JSONSchemaType<IUserDataStorageNameAvailabilityRequest> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string", ...USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    visibilityGroupId: {
      type: "string",
      ...USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.visibilityGroupId,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["name", "visibilityGroupId"],
  additionalProperties: false
} as const;

export const isValidUserDataStorageNameAvailabilityRequest: ValidateFunction<IUserDataStorageNameAvailabilityRequest> = AJV.compile(
  USER_DATA_STORAGE_NAME_AVAILABILITY_REQUEST_JSON_SCHEMA
);
