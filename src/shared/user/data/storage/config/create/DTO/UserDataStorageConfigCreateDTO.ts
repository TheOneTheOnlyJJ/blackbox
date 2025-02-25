import { JSONSchemaType } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA,
  UserDataStorageBackendConfigCreateDTO
} from "../../../backend/config/create/DTO/UserDataStorageBackendConfigCreateDTO";

export interface IUserDataStorageConfigCreateDTO {
  userId: string;
  name: string;
  description: string | null;
  visibilityPassword: string | null;
  backendConfigCreateDTO: UserDataStorageBackendConfigCreateDTO;
}

export const USER_DATA_STORAGE_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string", title: "User ID", format: "uuid" },
    name: { type: "string", title: "Name" },
    description: {
      type: "string",
      title: "Description",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    visibilityPassword: {
      type: "string",
      title: "Visibility Password",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    backendConfigCreateDTO: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA
  },
  required: ["userId", "name", "description", "visibilityPassword", "backendConfigCreateDTO"],
  additionalProperties: false
} as const;
