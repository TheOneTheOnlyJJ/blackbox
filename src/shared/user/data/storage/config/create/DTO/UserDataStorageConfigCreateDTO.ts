import { JSONSchemaType, ValidateFunction } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA,
  UserDataStorageBackendConfigCreateDTO
} from "../../../backend/config/create/DTO/UserDataStorageBackendConfigCreateDTO";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "../UserDataStorageConfigCreateConstants";

export interface IUserDataStorageConfigCreateDTO {
  userId: string;
  name: string;
  visibilityGroupId: string | null;
  description: string | null;
  backendConfigCreateDTO: UserDataStorageBackendConfigCreateDTO;
}

export const USER_DATA_STORAGE_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string", ...USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.userId },
    name: { type: "string", ...USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    visibilityGroupId: {
      type: "string",
      ...USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.visibilityGroupId,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    description: {
      type: "string",
      ...USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.description,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    backendConfigCreateDTO: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA
  },
  required: ["userId", "visibilityGroupId", "name", "description", "backendConfigCreateDTO"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGE_CONFIG_CREATE_DTO_VALIDATE_FUNCTION: ValidateFunction<IUserDataStorageConfigCreateDTO> = AJV.compile(
  USER_DATA_STORAGE_CONFIG_CREATE_DTO_JSON_SCHEMA
);
