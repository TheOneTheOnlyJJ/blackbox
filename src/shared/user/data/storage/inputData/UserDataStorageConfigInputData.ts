import { JSONSchemaType } from "ajv";
import {
  LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA,
  LocalSQLiteUserDataStorageConfigInputData
} from "./implementations/LocalSQLiteUserDataStorageConfigInputData";
import { USER_DATA_STORAGE_TYPES, UserDataStorageType } from "../UserDataStorageType";
import { OPTION_B_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA, OptionBUserDataStorageConfigInputData } from "./implementations/optionB";
import { OPTION_C_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA, OptionCUserDataStorageConfigInputData } from "./implementations/optionC";

// Map of every user data storage type to its corresponding config input data type
export interface IUserDataStorageConfigInputDataMap {
  [USER_DATA_STORAGE_TYPES.LocalSQLite]: LocalSQLiteUserDataStorageConfigInputData;
  [USER_DATA_STORAGE_TYPES.OptionB]: OptionBUserDataStorageConfigInputData;
  [USER_DATA_STORAGE_TYPES.OptionC]: OptionCUserDataStorageConfigInputData;
}
// Union of all user data storage concrete implementation config input data interfaces
export type UserDataStorageConfigInputData = IUserDataStorageConfigInputDataMap[keyof IUserDataStorageConfigInputDataMap];

type UserDataStorageConfigInputDataJsonSchemaMap = {
  [K in UserDataStorageType]: JSONSchemaType<IUserDataStorageConfigInputDataMap[K]>;
};
export const USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA_MAP: UserDataStorageConfigInputDataJsonSchemaMap = {
  [USER_DATA_STORAGE_TYPES.LocalSQLite]: LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA,
  [USER_DATA_STORAGE_TYPES.OptionB]: OPTION_B_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA,
  [USER_DATA_STORAGE_TYPES.OptionC]: OPTION_C_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA
} as const;

export const USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA: JSONSchemaType<UserDataStorageConfigInputData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataStorageConfigInputData>[]>(
      (accumulator: JSONSchemaType<UserDataStorageConfigInputData>[], currentValue: string) => {
        accumulator.push(USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA_MAP[currentValue as keyof typeof USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA_MAP]);
        return accumulator;
      },
      []
    )
} as const;
