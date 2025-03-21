export const USER_ACCOUNT_STORAGE_BACKEND_TYPES = {
  localSQLite: "localSQLite"
} as const;

export type UserAccountStorageBackendTypes = typeof USER_ACCOUNT_STORAGE_BACKEND_TYPES;
export type UserAccountStorageBackendType = UserAccountStorageBackendTypes[keyof UserAccountStorageBackendTypes];
