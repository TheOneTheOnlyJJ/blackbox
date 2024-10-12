import { LogFunctions } from "electron-log";
import { UserAccountStorage } from "./UserAccountStorage";
import { LocalSQLiteUserAccountStorage } from "./implementations/LocalSQLiteUserAccountStorage";
import { UserAccountStorageType } from "./UserAccountStorageType";
import Ajv from "ajv";
import { UserAccountStorageConfig } from "./UserAccountStorageConfig";

export function userAccountStorageFactory(
  config: UserAccountStorageConfig,
  logger: LogFunctions,
  ajv: Ajv
): UserAccountStorage<UserAccountStorageConfig> {
  logger.debug(`Running User Acount Storage factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case UserAccountStorageType.LocalSQLite:
      return new LocalSQLiteUserAccountStorage(config, logger, ajv);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid User Acount Storage type received: ${config.type}`);
  }
}
