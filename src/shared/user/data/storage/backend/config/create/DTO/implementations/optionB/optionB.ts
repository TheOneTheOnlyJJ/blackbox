import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfigCreateDTO } from "../../BaseUserDataStorageBackendConfigCreateDTO";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../../../constants/implementations/optionB/OptionBUserDataStorageBackendConstants";

export interface IOptionBUserDataStorageBackendConfigCreateDTO extends IBaseUserDataStorageBackendConfigCreateDTO {
  type: UserDataStorageBackendTypes["optionB"];
  optionB: string;
}

export const OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageBackendConfigCreateDTO> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.optionB],
      default: USER_DATA_STORAGE_BACKEND_TYPES.optionB
    },
    optionB: {
      type: "string",
      ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionB
    }
  },
  required: ["type", "optionB"],
  additionalProperties: false
} as const;
