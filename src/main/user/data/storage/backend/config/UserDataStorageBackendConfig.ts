import { JSONSchemaType } from "ajv";
import {
  LocalSQLiteUserDataStorageBackend,
  ILocalSQLiteUserDataStorageBackendConfig
} from "../implementations/localSQLite/LocalSQLiteUserDataStorageBackend";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { IOptionBUserDataStorageBackendConfig, OptionBUserDataStorageBackend } from "../implementations/optionB/optionB";
import { IOptionCUserDataStorageBackendConfig, OptionCUserDataStorageBackend } from "../implementations/optionC/optionC";

export interface IUserDataStorageBackendConfigMap {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: ILocalSQLiteUserDataStorageBackendConfig;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: IOptionBUserDataStorageBackendConfig;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: IOptionCUserDataStorageBackendConfig;
}
export type UserDataStorageBackendConfig = IUserDataStorageBackendConfigMap[keyof IUserDataStorageBackendConfigMap];

type UserDataStorageBackendConfigJSONSchemaMap = {
  [K in UserDataStorageBackendType]: JSONSchemaType<IUserDataStorageBackendConfigMap[K]>;
};
export const USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP: UserDataStorageBackendConfigJSONSchemaMap = {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: LocalSQLiteUserDataStorageBackend.CONFIG_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: OptionBUserDataStorageBackend.CONFIG_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: OptionCUserDataStorageBackend.CONFIG_JSON_SCHEMA
} as const;

export const USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA: JSONSchemaType<UserDataStorageBackendConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataStorageBackendConfig>[]>(
      (accumulator: JSONSchemaType<UserDataStorageBackendConfig>[], currentValue: string): JSONSchemaType<UserDataStorageBackendConfig>[] => {
        accumulator.push(USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP[currentValue as keyof UserDataStorageBackendConfigJSONSchemaMap]);
        return accumulator;
      },
      []
    )
} as const;
