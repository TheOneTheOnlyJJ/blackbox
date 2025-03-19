import { LogFunctions } from "electron-log";
import { LocalSQLiteUserDataStorageBackend } from "./implementations/LocalSQLite/LocalSQLiteUserDataStorageBackend";
import { UserDataStorageBackendConfig } from "./config/UserDataStorageBackendConfig";
import { USER_DATA_STORAGE_BACKEND_TYPES } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { OptionBUserDataStorageBackend } from "./implementations/optionB/optionB";
import { OptionCUserDataStorageBackend } from "./implementations/optionC/optionC";
import { UserDataStorageBackend } from "./UserDataStorageBackend";

export function userDataStorageBackendFactory(
  config: UserDataStorageBackendConfig,
  logScope: string,
  logger: LogFunctions | null
): UserDataStorageBackend {
  logger?.debug("Running User Data Storage Backend factory.");
  switch (config.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite:
      return new LocalSQLiteUserDataStorageBackend(config, logScope);
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionB:
      return new OptionBUserDataStorageBackend(config, logScope);
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionC:
      return new OptionCUserDataStorageBackend(config, logScope);
    default:
      throw new Error(`Invalid User Data Storage Backend type received: ${(config as { type: string }).type}`);
  }
}
