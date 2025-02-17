const DB_DIR_PATH_CONSTANTS = {
  title: "Database Directory Path",
  minLength: 1
} as const;

const DB_FILE_NAME_CONSTANTS = {
  title: "Database File Name",
  minLength: 1
} as const;

export const LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_CONSTANTS = {
  dbDirPath: DB_DIR_PATH_CONSTANTS,
  dbFileName: DB_FILE_NAME_CONSTANTS
} as const;
