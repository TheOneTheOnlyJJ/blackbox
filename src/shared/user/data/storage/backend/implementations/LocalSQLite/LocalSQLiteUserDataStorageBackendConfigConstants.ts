export const LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS = {
  type: {
    title: "Local SQLite"
  },
  dbDirPath: {
    title: "Database Directory Path",
    pattern: '^(?:[a-zA-Z]:\\\\|/)?(?:[^<>:"|?*]+[\\\\/])*[^<>:"|?*]*$',
    minLength: 1
  },
  dbFileName: {
    title: "Database File Name",
    pattern: '^[^<>:"/\\|?*]+$',
    minLength: 1
  }
} as const;
