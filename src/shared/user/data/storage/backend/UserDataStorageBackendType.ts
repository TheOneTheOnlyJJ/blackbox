export const USER_DATA_STORAGE_BACKEND_TYPES = {
  LocalSQLite: "localSQLite",
  OptionB: "optionB",
  OptionC: "optionC"
} as const;

export type UserDataStorageBackendTypes = typeof USER_DATA_STORAGE_BACKEND_TYPES;
export type UserDataStorageBackendType = UserDataStorageBackendTypes[keyof UserDataStorageBackendTypes];
