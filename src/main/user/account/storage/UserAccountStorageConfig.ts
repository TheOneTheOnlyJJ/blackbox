import { LocalSQLiteUserAccountStorageConfig } from "./implementations/LocalSQLiteUserAccountStorage";

// Union of all user account storage concrete implementation configuration interfaces
export type UserAccountStorageConfig = LocalSQLiteUserAccountStorageConfig;
