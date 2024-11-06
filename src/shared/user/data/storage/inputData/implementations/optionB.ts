import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_TYPES, UserDataStorageTypes } from "../../UserDataStorageType";
import { IBaseUserDataStorageConfigInputData } from "../BaseUserDataStorageConfigInputData";

export interface IOptionBUserDataStorageConfigInputData extends IBaseUserDataStorageConfigInputData {
  type: UserDataStorageTypes["OptionB"];
  optionB: string;
}

export const OPTION_B_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA: JSONSchemaType<IOptionBUserDataStorageConfigInputData> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_TYPES.OptionB],
      default: USER_DATA_STORAGE_TYPES.OptionB
    },
    optionB: {
      type: "string",
      minLength: 1
    }
  },
  required: ["type", "optionB"],
  additionalProperties: false
};
