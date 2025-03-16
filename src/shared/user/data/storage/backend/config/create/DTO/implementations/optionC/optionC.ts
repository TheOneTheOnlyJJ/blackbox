import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfigCreateDTO } from "../../BaseUserDataStorageBackendConfigCreateDTO";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../../../constants/implementations/optionC/OptionCUserDataStorageBackendConstants";

export interface IOptionCUserDataStorageBackendConfigCreateDTO extends IBaseUserDataStorageBackendConfigCreateDTO {
  type: UserDataStorageBackendTypes["OptionC"];
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendConfigCreateDTO> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.OptionC],
      default: USER_DATA_STORAGE_BACKEND_TYPES.OptionC,
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
