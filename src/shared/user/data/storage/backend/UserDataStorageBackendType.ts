export const USER_DATA_STORAGE_BACKEND_TYPES = {
  localSQLite: "localSQLite",
  optionB: "optionB",
  optionC: "optionC"
} as const;

export type UserDataStorageBackendTypes = typeof USER_DATA_STORAGE_BACKEND_TYPES;
export type UserDataStorageBackendType = UserDataStorageBackendTypes[keyof UserDataStorageBackendTypes];
