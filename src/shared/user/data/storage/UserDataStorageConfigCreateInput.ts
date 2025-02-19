import { JSONSchemaType } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  UserDataStorageBackendConfigCreateInput
} from "./backend/createInput/UserDataStorageBackendConfigCreateInput";

export interface IUserDataStorageConfigCreateInput {
  name: string;
  visibilityPassword?: string;
  // TODO: Add description & icon/image & confirm visibility password, implies new transformation in renderer
  backendConfigCreateInput: UserDataStorageBackendConfigCreateInput;
}

export const USER_DATA_STORAGE_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
    visibilityPassword: { type: "string", title: "Visibility Password", nullable: true },
    backendConfigCreateInput: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA
  },
  required: ["name", "backendConfigCreateInput"],
  additionalProperties: false
} as const;
