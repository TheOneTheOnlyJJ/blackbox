import { LogFunctions } from "electron-log";
import { UserStorage } from "./UserStorage";
import { SQLiteUserStorage, SQLiteUserStorageConfig } from "./implementations/SQLiteUserStorage";
import { UserStorageType } from "./UserStorageType";
import Ajv from "ajv";

// Union of all user storage concrete implementation configuration interfaces
export type UserStorageConfig = SQLiteUserStorageConfig;

export function userStorageFactory(config: UserStorageConfig, logger: LogFunctions, ajv: Ajv): UserStorage<UserStorageConfig> {
  logger.debug(`Running user storage factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case UserStorageType.SQLite:
      return new SQLiteUserStorage(config, logger, ajv);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid user storage type received: ${config.type}`);
  }
}
