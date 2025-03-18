import { USER_DATA_STORAGE_BACKEND_TYPES } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { LocalSQLiteUserDataStorageBackend } from "./implementations/LocalSQLite/LocalSQLiteUserDataStorageBackend";
import { OptionBUserDataStorageBackend } from "./implementations/optionB/optionB";
import { OptionCUserDataStorageBackend } from "./implementations/optionC/optionC";

// Map of every user data storage backend type to its corresponding config type
export interface IUserDataStorageBackendMap {
  [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: LocalSQLiteUserDataStorageBackend;
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: OptionBUserDataStorageBackend;
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: OptionCUserDataStorageBackend;
}
// Union of all user data storage backend config concrete implementation interfaces
export type UserDataStorageBackend = IUserDataStorageBackendMap[keyof IUserDataStorageBackendMap];
