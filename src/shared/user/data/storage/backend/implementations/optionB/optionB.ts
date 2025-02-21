import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfigCreateDTO } from "../../config/create/DTO/BaseUserDataStorageBackendConfigCreateDTO";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "../../UserDataStorageBackendType";

export interface IOptionBUserDataStorageBackendConfigCreateDTO extends IBaseUserDataStorageBackendConfigCreateDTO {
  type: UserDataStorageBackendTypes["OptionB"];
  optionB: string;
}

export const OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageBackendConfigCreateDTO> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.OptionB],
      default: USER_DATA_STORAGE_BACKEND_TYPES.OptionB
    },
    optionB: {
      type: "string",
      title: "OPTION B TITLE",
      minLength: 1
    }
  },
  required: ["type", "optionB"],
  additionalProperties: false
} as const;
