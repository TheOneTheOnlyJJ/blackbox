import { LogFunctions } from "electron-log";
import { UserAccountStorage } from "./UserAccountStorage";
import { SQLiteUserAccountStorage, SQLiteUserAccountStorageConfig } from "./implementations/SQLiteUserAccountStorage";
import { UserAccountStorageType } from "./UserAccountStorageType";
import Ajv from "ajv";

// Union of all user account storage concrete implementation configuration interfaces
export type UserAccountStorageConfig = SQLiteUserAccountStorageConfig;

export function userAccountStorageFactory(
  config: UserAccountStorageConfig,
  logger: LogFunctions,
  ajv: Ajv
): UserAccountStorage<UserAccountStorageConfig> {
  logger.debug(`Running User Acount Storage factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case UserAccountStorageType.SQLite:
      return new SQLiteUserAccountStorage(config, logger, ajv);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid User Acount Storage type received: ${config.type}`);
  }
}
