import { UserStorage } from "./UserStorage";
import { LogFunctions } from "electron-log";
import { SQLiteUserStorage } from "./SQLiteUserStorage";
import { UserStorageConfig, UserStorageType } from "../../../shared/user/storage/types";

export function userStorageFactory(config: UserStorageConfig, logger: LogFunctions): UserStorage<UserStorageConfig> {
  logger.debug(`Running user storage factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case UserStorageType.SQLite:
      return new SQLiteUserStorage(config, logger);
    default:
      throw new Error("Invalid user storage type received");
  }
}
