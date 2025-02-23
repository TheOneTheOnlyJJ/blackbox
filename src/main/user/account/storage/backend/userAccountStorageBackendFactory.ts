import { LogFunctions } from "electron-log";
import { LocalSQLiteUserAccountStorageBackend } from "./implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackend";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES } from "./UserAccountStorageBackendType";
import Ajv from "ajv";
import { UserAccountStorageBackendConfig } from "./config/UserAccountStorageBackendConfig";
import { UserAccountStorageBackend } from "./UserAccountStorageBackend";

export function userAccountStorageBackendFactory(config: UserAccountStorageBackendConfig, logger: LogFunctions, ajv: Ajv): UserAccountStorageBackend {
  logger.debug("Running User Acount Storage Backend factory.");
  switch (config.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite:
      return new LocalSQLiteUserAccountStorageBackend(config, logger, ajv);
    default:
      throw new Error(`Invalid User Acount Storage Backend type received: ${(config as { type: string }).type}`);
  }
}
