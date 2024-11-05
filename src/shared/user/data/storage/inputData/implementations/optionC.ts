import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_TYPES, UserDataStorageTypes } from "../../UserDataStorageType";
import { BaseUserDataStorageConfigInputData } from "../BaseUserDataStorageConfigInputData";

export interface OptionCUserDataStorageConfigInputData extends BaseUserDataStorageConfigInputData {
  type: UserDataStorageTypes["OptionC"];
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA: JSONSchemaType<OptionCUserDataStorageConfigInputData> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_TYPES.OptionC],
      default: USER_DATA_STORAGE_TYPES.OptionC
    },
    optionC: {
      type: "string",
      minLength: 10
    }
  },
  required: ["type", "optionC"],
  additionalProperties: false
};
