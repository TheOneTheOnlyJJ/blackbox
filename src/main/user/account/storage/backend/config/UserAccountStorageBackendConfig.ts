import { JSONSchemaType } from "ajv";
import {
  ILocalSQLiteUserAccountStorageBackendConfig,
  LocalSQLiteUserAccountStorageBackend
} from "../implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackend";
import {
  USER_ACCOUNT_STORAGE_BACKEND_TYPES,
  UserAccountStorageBackendType
} from "@shared/user/account/storage/backend/UserAccountStorageBackendType";

// Map of every user account storage backend type to its corresponding config type
export interface IUserAccountStorageBackendConfigMap {
  [USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite]: ILocalSQLiteUserAccountStorageBackendConfig;
}
// Union of all user account storage backend config concrete implementation interfaces
export type UserAccountStorageBackendConfig = IUserAccountStorageBackendConfigMap[keyof IUserAccountStorageBackendConfigMap];

type UserAccountStorageBackendConfigJSONSchemaMap = {
  [K in UserAccountStorageBackendType]: JSONSchemaType<IUserAccountStorageBackendConfigMap[K]>;
};
export const USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP: UserAccountStorageBackendConfigJSONSchemaMap = {
  [USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite]: LocalSQLiteUserAccountStorageBackend.CONFIG_JSON_SCHEMA
} as const;

export const USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA: JSONSchemaType<UserAccountStorageBackendConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserAccountStorageBackendConfig>[]>(
      (accumulator: JSONSchemaType<UserAccountStorageBackendConfig>[], currentValue: string): JSONSchemaType<UserAccountStorageBackendConfig>[] => {
        accumulator.push(USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_MAP[currentValue as keyof UserAccountStorageBackendConfigJSONSchemaMap]);
        return accumulator;
      },
      []
    )
} as const;
