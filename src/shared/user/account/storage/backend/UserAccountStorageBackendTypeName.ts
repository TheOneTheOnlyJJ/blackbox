import { USER_ACCOUNT_STORAGE_BACKEND_TYPES, UserAccountStorageBackendType } from "./UserAccountStorageBackendType";

export const USER_ACCOUNT_STORAGE_BACKEND_TYPE_NAMES: Record<UserAccountStorageBackendType, string> = {
  [USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite]: "Local SQLite"
} as const;

export type UserAccountStorageBackendTypeNames = typeof USER_ACCOUNT_STORAGE_BACKEND_TYPE_NAMES;
export type UserAccountStorageBackendTypeName = UserAccountStorageBackendTypeNames[keyof UserAccountStorageBackendTypeNames];
