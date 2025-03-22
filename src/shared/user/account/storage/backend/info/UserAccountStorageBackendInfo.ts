import {
  USER_ACCOUNT_STORAGE_BACKEND_TYPES,
  UserAccountStorageBackendType
} from "@shared/user/account/storage/backend/UserAccountStorageBackendType";
import { JSONSchemaType } from "ajv";
import {
  ILocalSQLiteUserAccountStorageBackendInfo,
  LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA
} from "./implementations/localSQLite/LocalSQLiteUserAccountStorageBackendInfo";

// Map of every user account storage backend type to its corresponding info type
export interface IUserAccountStorageBackendInfoMap {
  [USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite]: ILocalSQLiteUserAccountStorageBackendInfo;
}
// Union of all concrete user account storage backend config info interfaces
export type UserAccountStorageBackendInfo = IUserAccountStorageBackendInfoMap[keyof IUserAccountStorageBackendInfoMap];

type UserAccountStorageBackendInfoJSONSchemaMap = {
  [K in UserAccountStorageBackendType]: JSONSchemaType<IUserAccountStorageBackendInfoMap[K]>;
};
export const USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_MAP: UserAccountStorageBackendInfoJSONSchemaMap = {
  [USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite]: LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA
} as const;

export const USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA: JSONSchemaType<UserAccountStorageBackendInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserAccountStorageBackendInfo>[]>(
      (accumulator: JSONSchemaType<UserAccountStorageBackendInfo>[], currentValue: string): JSONSchemaType<UserAccountStorageBackendInfo>[] => {
        accumulator.push(USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_MAP[currentValue as keyof UserAccountStorageBackendInfoJSONSchemaMap]);
        return accumulator;
      },
      []
    )
} as const;
