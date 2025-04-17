import { LogFunctions } from "electron-log";
import { LocalSQLiteUserAccountStorageBackend } from "./implementations/localSQLite/LocalSQLiteUserAccountStorageBackend";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES } from "@shared/user/account/storage/backend/UserAccountStorageBackendType";
import { UserAccountStorageBackendConfig } from "./config/UserAccountStorageBackendConfig";
import { UserAccountStorageBackend } from "./UserAccountStorageBackend";
import { IUserAccountStorageBackendHandlers } from "./BaseUserAccountStorageBackend";

export function userAccountStorageBackendFactory(
  config: UserAccountStorageBackendConfig,
  logScope: string,
  handlers: IUserAccountStorageBackendHandlers,
  logger: LogFunctions | null
): UserAccountStorageBackend {
  logger?.debug("Running User Acount Storage Backend factory.");
  switch (config.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite:
      return new LocalSQLiteUserAccountStorageBackend(config, logScope, handlers);
    default:
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      throw new Error(`Invalid User Acount Storage Backend config received: ${String(config)}`);
  }
}
