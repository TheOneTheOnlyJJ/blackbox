import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfig } from "../../config/BaseUserDataStorageBackendConfig";

export interface IOptionBUserDataStorageBackendConfig extends IBaseUserDataStorageBackendConfig {
  type: UserDataStorageBackendTypes["OptionB"];
  optionB: string;
}

export const OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageBackendConfig> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.OptionB],
      default: USER_DATA_STORAGE_BACKEND_TYPES.OptionB
    },
    optionB: {
      type: "string",
      minLength: 1
    }
  },
  required: ["type", "optionB"],
  additionalProperties: false
} as const;
