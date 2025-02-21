import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfigCreateDTO } from "../../config/create/DTO/BaseUserDataStorageBackendConfigCreateDTO";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "../../UserDataStorageBackendType";

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
      default: USER_DATA_STORAGE_BACKEND_TYPES.OptionC
    },
    optionC: {
      type: "string",
      title: "This is Option C Title",
      minLength: 10
    }
  },
  required: ["type", "optionC"],
  additionalProperties: false
} as const;
