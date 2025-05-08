import { JSONSchemaType } from "ajv";
import {
  ILocalSQLiteUserAccountStorageBackendConfig,
  LocalSQLiteUserAccountStorageBackend
} from "../implementations/localSQLite/LocalSQLiteUserAccountStorageBackend";
import {
  USER_ACCOUNT_STORAGE_BACKEND_TYPES,
  UserAccountStorageBackendType
} from "@shared/user/account/storage/backend/UserAccountStorageBackendType";

export interface IUserAccountStorageBackendConfigMap {
  [USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite]: ILocalSQLiteUserAccountStorageBackendConfig;
}
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
