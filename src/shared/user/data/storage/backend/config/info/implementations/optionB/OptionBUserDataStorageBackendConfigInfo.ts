import { JSONSchemaType } from "ajv";
import {
  BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS,
  IBaseUserDataStorageBackendConfigInfo
} from "../../BaseUserDataStorageBackendConfigInfo";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "../../../../UserDataStorageBackendType";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../../constants/implementations/optionB/OptionBUserDataStorageBackendConstants";

export interface IOptionBUserDataStorageBackendConfigInfo extends IBaseUserDataStorageBackendConfigInfo {
  type: UserDataStorageBackendTypes["optionB"];
  optionB: string;
}

export const OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageBackendConfigInfo> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.optionB],
      ...BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.type
    },
    optionB: {
      type: "string",
      ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionB
    },
    isLocal: {
      type: "boolean",
      ...BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.isLocal
    }
  },
  required: ["type", "optionB", "isLocal"],
  additionalProperties: false
} as const;
