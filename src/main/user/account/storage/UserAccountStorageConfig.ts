import { ILocalSQLiteUserAccountStorageConfig } from "./implementations/LocalSQLiteUserAccountStorage";

// Union of all user account storage concrete implementation config interfaces
export type UserAccountStorageConfig = ILocalSQLiteUserAccountStorageConfig;
