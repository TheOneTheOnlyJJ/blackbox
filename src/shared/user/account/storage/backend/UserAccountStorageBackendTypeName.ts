import { USER_ACCOUNT_STORAGE_BACKEND_TYPES, UserAccountStorageBackendType } from "./UserAccountStorageBackendType";

export const USER_ACCOUNT_STORAGE_BACKEND_TYPE_NAMES = {
  [USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite]: "Local SQLite"
} as const satisfies Record<UserAccountStorageBackendType, string>;

export type UserAccountStorageBackendTypeNames = typeof USER_ACCOUNT_STORAGE_BACKEND_TYPE_NAMES;
export type UserAccountStorageBackendTypeName = UserAccountStorageBackendTypeNames[keyof UserAccountStorageBackendTypeNames];
