export const USER_ACCOUNT_STORAGE_BACKEND_TYPES = {
  LocalSQLite: "Local SQLite"
} as const;

export type UserAccountStorageBackendTypes = typeof USER_ACCOUNT_STORAGE_BACKEND_TYPES;
export type UserAccountStorageBackendType = UserAccountStorageBackendTypes[keyof UserAccountStorageBackendTypes];
