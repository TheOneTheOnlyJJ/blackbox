import { LogFunctions } from "electron-log";
import Ajv from "ajv";
import { LocalSQLiteUserDataStorage } from "./implementations/LocalSQLiteUserDataStorage";
import { UserDataStorageType } from "./UserDataStorageType";
import { UserDataStorage } from "./UserDataStorage";
import { UserDataStorageConfig } from "./UserDataStorageConfig";

export function userDataStorageFactory(config: UserDataStorageConfig, logger: LogFunctions, ajv: Ajv): UserDataStorage<UserDataStorageConfig> {
  logger.debug(`Running User Data Storage factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case UserDataStorageType.LocalSQLite:
      return new LocalSQLiteUserDataStorage(config, logger, ajv);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid User Data Storage type received: ${config.type}`);
  }
}
