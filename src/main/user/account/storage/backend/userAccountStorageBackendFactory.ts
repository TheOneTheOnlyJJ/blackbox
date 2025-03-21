import { LogFunctions } from "electron-log";
import { LocalSQLiteUserAccountStorageBackend } from "./implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackend";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES } from "@shared/user/account/storage/backend/UserAccountStorageBackendType";
import { UserAccountStorageBackendConfig } from "./config/UserAccountStorageBackendConfig";
import { UserAccountStorageBackend } from "./UserAccountStorageBackend";

export function userAccountStorageBackendFactory(
  config: UserAccountStorageBackendConfig,
  logScope: string,
  logger: LogFunctions | null
): UserAccountStorageBackend {
  logger?.debug("Running User Acount Storage Backend factory.");
  switch (config.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite:
      return new LocalSQLiteUserAccountStorageBackend(config, logScope);
    default:
      throw new Error(`Invalid User Acount Storage Backend type received: ${(config as { type: string }).type}`);
  }
}
