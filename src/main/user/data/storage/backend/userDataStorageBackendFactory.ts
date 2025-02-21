import { LogFunctions } from "electron-log";
import Ajv from "ajv";
import { LocalSQLiteUserDataStorageBackend } from "./implementations/LocalSQLite/LocalSQLiteUserDataStorageBackend";
import { UserDataStorageBackend } from "./UserDataStorageBackend";
import { UserDataStorageBackendConfig } from "./config/UserDataStorageBackendConfig";
import { USER_DATA_STORAGE_BACKEND_TYPES } from "@shared/user/data/storage/backend/UserDataStorageBackendType";

export function userDataStorageBackendFactory(
  config: UserDataStorageBackendConfig,
  logger: LogFunctions,
  ajv: Ajv
): UserDataStorageBackend<UserDataStorageBackendConfig> {
  logger.debug(`Running User Data Storage Backend factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite:
      return new LocalSQLiteUserDataStorageBackend(config, logger, ajv);
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionB:
      throw new Error("Cannot initialise Option B user data storage backend! It's just a testing option!");
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionC:
      throw new Error("Cannot initialise Option C user data storage backend! It's just a testing option!");
    default:
      throw new Error(`Invalid User Data Storage Backend type received: ${(config as { type: string }).type}`);
  }
}
