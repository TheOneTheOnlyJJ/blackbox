import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "../../UserDataStorageBackendType";
import { IBaseUserDataStorageBackendConfigCreateInput } from "../BaseUserDataStorageBackendConfigCreateInput";

export interface IOptionCUserDataStorageBackendConfigCreateInput extends IBaseUserDataStorageBackendConfigCreateInput {
  type: UserDataStorageBackendTypes["OptionC"];
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendConfigCreateInput> = {
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
