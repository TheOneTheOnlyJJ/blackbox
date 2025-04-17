import { LogFunctions } from "electron-log";
import { LocalSQLiteUserDataStorageBackend } from "./implementations/localSQLite/LocalSQLiteUserDataStorageBackend";
import { UserDataStorageBackendConfig } from "./config/UserDataStorageBackendConfig";
import { USER_DATA_STORAGE_BACKEND_TYPES } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { OptionBUserDataStorageBackend } from "./implementations/optionB/optionB";
import { OptionCUserDataStorageBackend } from "./implementations/optionC/optionC";
import { UserDataStorageBackend } from "./UserDataStorageBackend";
import { IUserDataStorageBackendHandlers } from "./BaseUserDataStorageBackend";

export function userDataStorageBackendFactory(
  config: UserDataStorageBackendConfig,
  logScope: string,
  handlers: IUserDataStorageBackendHandlers,
  logger: LogFunctions | null
): UserDataStorageBackend {
  /// TOD: Remove ts-expect-error when 5.9 releases
  logger?.debug("Running User Data Storage Backend factory.");
  switch (config.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.localSQLite:
      return new LocalSQLiteUserDataStorageBackend(config, logScope, handlers);
    case USER_DATA_STORAGE_BACKEND_TYPES.optionB:
      return new OptionBUserDataStorageBackend(config, logScope, handlers);
    case USER_DATA_STORAGE_BACKEND_TYPES.optionC:
      return new OptionCUserDataStorageBackend(config, logScope, handlers);
    default:
      throw new Error(`Invalid User Data Storage Backend config received: ${String(config)}`);
  }
}
