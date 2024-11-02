export const USER_ACCOUNT_STORAGE_TYPE = {
  LocalSQLite: "Local SQLite"
} as const;

export type UserAccountStorageTypes = typeof USER_ACCOUNT_STORAGE_TYPE;
export type UserAccountStorageType = UserAccountStorageTypes[keyof UserAccountStorageTypes];
