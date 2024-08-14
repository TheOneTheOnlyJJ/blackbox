import { LogFunctions } from "electron-log";
import { UserStorageConfig } from "./utils";
import { UserStorage } from "./UserStorage";
import { SQLiteUserStorage } from "./implementations/SQLiteUserStorage";
import { UserStorageType } from "./UserStorageType";

export function userStorageFactory(config: UserStorageConfig, logger: LogFunctions): UserStorage<UserStorageConfig> {
  logger.debug(`Running user storage factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case UserStorageType.SQLite:
      return new SQLiteUserStorage(config, logger);
    default:
      // This is here as a last-resort option, but ESlint bitches about it
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid user storage type received: ${config.type}`);
  }
}
