import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "./UserDataStorageBackendType";

export const USER_DATA_STORAGE_BACKEND_TYPE_NAMES: Record<UserDataStorageBackendType, string> = {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: "Local SQLite",
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: "Option B Mock",
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: "Option C Mock"
} as const;

export type UserDataStorageBackendTypeNames = typeof USER_DATA_STORAGE_BACKEND_TYPE_NAMES;
export type UserDataStorageBackendTypeName = UserDataStorageBackendTypeNames[keyof UserDataStorageBackendTypeNames];
