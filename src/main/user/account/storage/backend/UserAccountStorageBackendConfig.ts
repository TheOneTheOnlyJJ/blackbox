import { ILocalSQLiteUserAccountStorageBackendConfig } from "./implementations/LocalSQLiteUserAccountStorageBackend";

// Union of all user account storage backend concrete implementation config interfaces
export type UserAccountStorageBackendConfig = ILocalSQLiteUserAccountStorageBackendConfig;
