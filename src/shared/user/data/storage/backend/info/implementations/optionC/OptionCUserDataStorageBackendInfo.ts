import { JSONSchemaType } from "ajv";
import { BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS, IBaseUserDataStorageBackendInfo } from "../../BaseUserDataStorageBackendInfo";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../constants/implementations/optionC/OptionCUserDataStorageBackendConstants";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "../../../UserDataStorageBackendType";

export interface IOptionCUserDataStorageBackendInfo extends IBaseUserDataStorageBackendInfo {
  type: UserDataStorageBackendTypes["optionC"];
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendInfo> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.optionC],
      ...BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.type
    },
    optionC: {
      type: "string",
      ...OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionC
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
  required: ["type", "optionC", "isOpen", "isLocal"],
  additionalProperties: false
} as const;
