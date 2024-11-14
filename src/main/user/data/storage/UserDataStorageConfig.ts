import { JSONSchemaType } from "ajv";
import { LocalSQLiteUserDataStorage, ILocalSQLiteUserDataStorageConfig } from "./implementations/LocalSQLiteUserDataStorage";
import { USER_DATA_STORAGE_TYPES, UserDataStorageType } from "@shared/user/data/storage/UserDataStorageType";
import { IOptionBUserDataStorageConfig, OPTION_B_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA } from "./implementations/optionB";
import { IOptionCUserDataStorageConfig, OPTION_C_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA } from "./implementations/optionC";

// Map of every user data storage type to its corresponding config data type
export interface IUserDataStorageConfigMap {
  [USER_DATA_STORAGE_TYPES.LocalSQLite]: ILocalSQLiteUserDataStorageConfig;
  [USER_DATA_STORAGE_TYPES.OptionB]: IOptionBUserDataStorageConfig;
  [USER_DATA_STORAGE_TYPES.OptionC]: IOptionCUserDataStorageConfig;
}
// Union of all user data storage concrete implementation config interfaces
export type UserDataStorageConfig = IUserDataStorageConfigMap[keyof IUserDataStorageConfigMap];

type UserDataStorageConfigJSONSchemaMap = {
  [K in UserDataStorageType]: JSONSchemaType<IUserDataStorageConfigMap[K]>;
};
export const USER_DATA_STORAGE_CONFIG_JSON_SCHEMA_MAP: UserDataStorageConfigJSONSchemaMap = {
  [USER_DATA_STORAGE_TYPES.LocalSQLite]: LocalSQLiteUserDataStorage.CONFIG_JSON_SCHEMA,
  [USER_DATA_STORAGE_TYPES.OptionB]: OPTION_B_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA,
  [USER_DATA_STORAGE_TYPES.OptionC]: OPTION_C_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA
} as const;

export const USER_DATA_STORAGE_CONFIG_JSON_SCHEMA: JSONSchemaType<UserDataStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_CONFIG_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataStorageConfig>[]>((accumulator: JSONSchemaType<UserDataStorageConfig>[], currentValue: string) => {
      accumulator.push(USER_DATA_STORAGE_CONFIG_JSON_SCHEMA_MAP[currentValue as keyof typeof USER_DATA_STORAGE_CONFIG_JSON_SCHEMA_MAP]);
      return accumulator;
    }, [])
} as const;
