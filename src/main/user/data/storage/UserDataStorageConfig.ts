import { LocalSQLiteUserDataStorageConfig } from "./implementations/LocalSQLiteUserDataStorage";

// Union of all user data storage concrete implementation configuration interfaces
export type UserDataStorageConfig = LocalSQLiteUserDataStorageConfig;
