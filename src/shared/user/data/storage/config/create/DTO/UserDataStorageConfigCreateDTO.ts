import { JSONSchemaType } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA,
  UserDataStorageBackendConfigCreateDTO
} from "../../../backend/config/create/DTO/UserDataStorageBackendConfigCreateDTO";

export interface IUserDataStorageConfigCreateDTO {
  userId: string;
  name: string;
  description?: string;
  visibilityPassword?: string;
  backendConfigCreateDTO: UserDataStorageBackendConfigCreateDTO;
}

export const USER_DATA_STORAGE_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string", title: "User ID", format: "uuid" },
    name: { type: "string", title: "Name" },
    description: { type: "string", title: "Description", nullable: true },
    visibilityPassword: { type: "string", title: "Visibility Password", nullable: true },
    backendConfigCreateDTO: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA
  },
  required: ["userId", "name", "backendConfigCreateDTO"],
  additionalProperties: false
} as const;
