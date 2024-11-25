import { LogFunctions } from "electron-log";
import { UserAccountStorage } from "./UserAccountStorage";
import { LocalSQLiteUserAccountStorage } from "./implementations/LocalSQLiteUserAccountStorage";
import { USER_ACCOUNT_STORAGE_TYPE } from "./UserAccountStorageType";
import Ajv from "ajv";
import { UserAccountStorageConfig } from "./UserAccountStorageConfig";

export function userAccountStorageFactory(
  config: UserAccountStorageConfig,
  logger: LogFunctions,
  ajv: Ajv
): UserAccountStorage<UserAccountStorageConfig> {
  logger.debug(`Running User Acount Storage factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case USER_ACCOUNT_STORAGE_TYPE.LocalSQLite:
      return new LocalSQLiteUserAccountStorage(config, logger, ajv);
    default:
      throw new Error(`Invalid User Acount Storage type received: ${(config as { type: string }).type}`);
  }
}
