import { JSONSchemaType, ValidateFunction } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA,
  UserDataStorageBackendConfigCreateDTO
} from "../../../backend/config/create/DTO/UserDataStorageBackendConfigCreateDTO";
import { AJV } from "@shared/utils/AJVJSONValidator";

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
    userId: { type: "string", title: "User ID", format: "uuid" },
    name: { type: "string", title: "Name" },
    visibilityGroupId: {
      type: "string",
      format: "uuid",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    description: {
      type: "string",
      title: "Description",
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
