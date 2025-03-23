export const LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS = {
  dbDirPath: {
    title: "Database Directory Path",
    minLength: 1
  },
  dbFileName: {
    title: "Database File Name",
    minLength: 1
  }
} as const;
