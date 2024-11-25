import { LogFunctions } from "electron-log";
import Ajv from "ajv";
import { LocalSQLiteUserDataStorage } from "./implementations/LocalSQLiteUserDataStorage";
import { UserDataStorage } from "./UserDataStorage";
import { UserDataStorageConfig } from "./UserDataStorageConfig";
import { USER_DATA_STORAGE_TYPES } from "@shared/user/data/storage/UserDataStorageType";

export function userDataStorageFactory(config: UserDataStorageConfig, logger: LogFunctions, ajv: Ajv): UserDataStorage<UserDataStorageConfig> {
  logger.debug(`Running User Data Storage factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case USER_DATA_STORAGE_TYPES.LocalSQLite:
      return new LocalSQLiteUserDataStorage(config, logger, ajv);
    case USER_DATA_STORAGE_TYPES.OptionB:
      throw new Error("Cannot initialise Option B user data storage! It's just a testing option!");
    case USER_DATA_STORAGE_TYPES.OptionC:
      throw new Error("Cannot initialise Option C user data storage! It's just a testing option!");
    default:
      throw new Error(`Invalid User Data Storage type received: ${(config as { type: string }).type}`);
  }
}
