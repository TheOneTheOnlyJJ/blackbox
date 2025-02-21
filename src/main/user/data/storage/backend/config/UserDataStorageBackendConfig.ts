import { JSONSchemaType } from "ajv";
import {
  LocalSQLiteUserDataStorageBackend,
  ILocalSQLiteUserDataStorageBackendConfig
} from "../implementations/LocalSQLite/LocalSQLiteUserDataStorageBackend";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { IOptionBUserDataStorageBackendConfig, OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA } from "../implementations/optionB/optionB";
import { IOptionCUserDataStorageBackendConfig, OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA } from "../implementations/optionC/optionC";

// Map of every user data storage backend type to its corresponding config type
export interface IUserDataStorageBackendConfigMap {
  [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: ILocalSQLiteUserDataStorageBackendConfig;
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: IOptionBUserDataStorageBackendConfig;
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: IOptionCUserDataStorageBackendConfig;
}
// Union of all user data storage backend config concrete implementation interfaces
export type UserDataStorageBackendConfig = IUserDataStorageBackendConfigMap[keyof IUserDataStorageBackendConfigMap];

type UserDataStorageBackendConfigJSONSchemaMap = {
  [K in UserDataStorageBackendType]: JSONSchemaType<IUserDataStorageBackendConfigMap[K]>;
};
export const USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP: UserDataStorageBackendConfigJSONSchemaMap = {
  [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: LocalSQLiteUserDataStorageBackend.CONFIG_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA
} as const;

export const USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA: JSONSchemaType<UserDataStorageBackendConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataStorageBackendConfig>[]>((accumulator: JSONSchemaType<UserDataStorageBackendConfig>[], currentValue: string) => {
      accumulator.push(
        USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP[currentValue as keyof typeof USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP]
      );
      return accumulator;
    }, [])
} as const;
