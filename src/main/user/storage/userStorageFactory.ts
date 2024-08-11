import { UserStorage } from "./UserStorage";
import { LogFunctions } from "electron-log";
import { SQLiteUserStorage } from "./SQLiteUserStorage";
import { UserStorageConfig, UserStorageType } from "../../../shared/user/storage/types";

export function userStorageFactory(config: UserStorageConfig, logger: LogFunctions): UserStorage<UserStorageConfig> {
  switch (config.type) {
    case UserStorageType.SQLite:
      return new SQLiteUserStorage(config, logger);
    default:
      throw new Error("Invalid user storage type received");
  }
}
