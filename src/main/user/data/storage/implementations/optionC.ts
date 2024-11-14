import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageConfig } from "../UserDataStorage";
import { USER_DATA_STORAGE_TYPES, UserDataStorageTypes } from "@shared/user/data/storage/UserDataStorageType";

export interface IOptionCUserDataStorageConfig extends IBaseUserDataStorageConfig {
  type: UserDataStorageTypes["OptionC"];
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageConfig> = {
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
} as const;
