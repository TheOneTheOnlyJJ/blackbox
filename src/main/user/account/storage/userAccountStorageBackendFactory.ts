import { LogFunctions } from "electron-log";
import { UserAccountStorageBackend } from "./UserAccountStorageBackend";
import { LocalSQLiteUserAccountStorageBackend } from "./implementations/LocalSQLiteUserAccountStorageBackend";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES } from "./UserAccountStorageBackendType";
import Ajv from "ajv";
import { UserAccountStorageBackendConfig } from "./UserAccountStorageBackendConfig";

export function userAccountStorageBackendFactory(
  config: UserAccountStorageBackendConfig,
  logger: LogFunctions,
  ajv: Ajv
): UserAccountStorageBackend<UserAccountStorageBackendConfig> {
  logger.debug(`Running User Acount Storage Backend factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite:
      return new LocalSQLiteUserAccountStorageBackend(config, logger, ajv);
    default:
      throw new Error(`Invalid User Acount Storage Backend type received: ${(config as { type: string }).type}`);
  }
}
