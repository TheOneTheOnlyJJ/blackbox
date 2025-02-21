import { ILocalSQLiteUserAccountStorageBackendConfig } from "../implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackend";

// Union of all user account storage backend concrete implementation config interfaces
export type UserAccountStorageBackendConfig = ILocalSQLiteUserAccountStorageBackendConfig;
