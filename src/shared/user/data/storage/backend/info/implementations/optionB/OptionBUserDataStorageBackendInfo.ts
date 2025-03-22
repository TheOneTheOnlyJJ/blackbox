import { JSONSchemaType } from "ajv";
import { BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS, IBaseUserDataStorageBackendInfo } from "../../BaseUserDataStorageBackendInfo";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../constants/implementations/optionB/OptionBUserDataStorageBackendConstants";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "../../../UserDataStorageBackendType";

export interface IOptionBUserDataStorageBackendInfo extends IBaseUserDataStorageBackendInfo {
  type: UserDataStorageBackendTypes["optionB"];
  optionB: string;
}

export const OPTION_B_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageBackendInfo> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.optionB],
      ...BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.type
    },
    optionB: {
      type: "string",
      ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionB
    },
    isOpen: {
      type: "boolean",
      ...BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isOpen
    },
    isLocal: {
      type: "boolean",
      ...BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isLocal
    }
  },
  required: ["type", "optionB", "isOpen", "isLocal"],
  additionalProperties: false
} as const;
