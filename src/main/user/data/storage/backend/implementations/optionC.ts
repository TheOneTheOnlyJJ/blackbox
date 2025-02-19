import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfig } from "../UserDataStorageBackend";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";

export interface IOptionCUserDataStorageBackendConfig extends IBaseUserDataStorageBackendConfig {
  type: UserDataStorageBackendTypes["OptionC"];
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendConfig> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.OptionC],
      default: USER_DATA_STORAGE_BACKEND_TYPES.OptionC
    },
    optionC: {
      type: "string",
      minLength: 10
    }
  },
  required: ["type", "optionC"],
  additionalProperties: false
} as const;
