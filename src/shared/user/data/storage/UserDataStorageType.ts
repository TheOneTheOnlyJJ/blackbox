export const USER_DATA_STORAGE_TYPES = {
  LocalSQLite: "Local SQLite"
} as const;

export type UserDataStorageTypes = typeof USER_DATA_STORAGE_TYPES;
export type UserDataStorageType = UserDataStorageTypes[keyof UserDataStorageTypes];
