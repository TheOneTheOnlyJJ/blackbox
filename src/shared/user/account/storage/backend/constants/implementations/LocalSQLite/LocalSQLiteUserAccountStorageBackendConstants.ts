import { USER_ACCOUNT_STORAGE_BACKEND_TYPE_NAMES } from "../../../UserAccountStorageBackendTypeName";

export const LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS = {
  type: {
    title: USER_ACCOUNT_STORAGE_BACKEND_TYPE_NAMES.localSQLite
  }, // TODO: This should be "Type" from a BASE_... type like in base account storage backend info
  dbDirPath: {
    title: "Database Directory Path",
    minLength: 1
  },
  dbFileName: {
    title: "Database File Name",
    minLength: 1
  }
} as const;
