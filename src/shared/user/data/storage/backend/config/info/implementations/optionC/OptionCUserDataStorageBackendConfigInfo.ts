import { JSONSchemaType } from "ajv";
import {
  BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS,
  IBaseUserDataStorageBackendConfigInfo
} from "../../BaseUserDataStorageBackendConfigInfo";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "../../../../UserDataStorageBackendType";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../../constants/implementations/optionC/OptionCUserDataStorageBackendConstants";

export interface IOptionCUserDataStorageBackendConfigInfo extends IBaseUserDataStorageBackendConfigInfo {
  type: UserDataStorageBackendTypes["optionC"];
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendConfigInfo> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.optionC],
      ...BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.type
    },
    optionC: {
      type: "string",
      ...OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionC
    },
    isLocal: {
      type: "boolean",
      ...BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.isLocal
    }
  },
  required: ["type", "optionC", "isLocal"],
  additionalProperties: false
} as const;
