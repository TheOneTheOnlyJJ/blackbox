import { BaseUserAccountStorageBackend } from "./BaseUserAccountStorageBackend";
import { IBaseUserAccountStorageBackendConfig } from "./config/BaseUserAccountStorageBackendConfig";
import { LocalSQLiteUserAccountStorageBackend } from "./implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackend";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES, UserAccountStorageBackendType } from "./UserAccountStorageBackendType";

// Map of every user account storage backend type to its corresponding config type
export interface IUserAccountStorageBackendMap
  extends Record<UserAccountStorageBackendType, BaseUserAccountStorageBackend<IBaseUserAccountStorageBackendConfig>> {
  [USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite]: LocalSQLiteUserAccountStorageBackend;
}
// Union of all user account storage backend config concrete implementation interfaces
export type UserAccountStorageBackend = IUserAccountStorageBackendMap[keyof IUserAccountStorageBackendMap];
