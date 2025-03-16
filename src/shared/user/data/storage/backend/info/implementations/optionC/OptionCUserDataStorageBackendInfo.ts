import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendInfo } from "../../BaseUserDataStorageBackendInfo";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../constants/implementations/optionC/OptionCUserDataStorageBackendConstants";

export interface IOptionCUserDataStorageBackendInfo extends IBaseUserDataStorageBackendInfo {
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendInfo> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      ...OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
    },
    optionC: {
      type: "string",
      ...OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionC
    }
  },
  required: ["type", "optionC"],
  additionalProperties: false
} as const;
