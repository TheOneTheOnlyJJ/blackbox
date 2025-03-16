import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendInfo } from "../../BaseUserDataStorageBackendInfo";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../constants/implementations/optionB/OptionBUserDataStorageBackendConstants";

export interface IOptionBUserDataStorageBackendInfo extends IBaseUserDataStorageBackendInfo {
  optionB: string;
}

export const OPTION_B_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageBackendInfo> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
    },
    optionB: {
      type: "string",
      ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionB
    }
  },
  required: ["type", "optionB"],
  additionalProperties: false
} as const;
