import { USER_DATA_STORAGE_TYPES, UserDataStorageTypes } from "@shared/user/data/storage/UserDataStorageType";
import { IBaseUserDataStorageConfig } from "../UserDataStorage";
import { JSONSchemaType } from "ajv";

export interface IOptionBUserDataStorageConfig extends IBaseUserDataStorageConfig {
  type: UserDataStorageTypes["OptionB"];
  optionB: string;
}

export const OPTION_B_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageConfig> = {
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
} as const;
