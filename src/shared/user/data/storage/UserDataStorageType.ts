export const USER_DATA_STORAGE_TYPES = {
  LocalSQLite: "localSQLite",
  OptionB: "optionB",
  OptionC: "optionC"
} as const;

export type UserDataStorageTypes = typeof USER_DATA_STORAGE_TYPES;
export type UserDataStorageType = UserDataStorageTypes[keyof UserDataStorageTypes];
