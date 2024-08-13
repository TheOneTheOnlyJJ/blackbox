import { LogFunctions } from "electron-log";
import { UserStorageConfig } from "../../shared/user/storage/types";
import { UserStorage } from "./storage/UserStorage";
import { userStorageFactory } from "./storage/userStorageFactory";

export class UserAccountManager {
  private static instance: null | UserAccountManager = null;

  private readonly logger: LogFunctions;
  private userStorage: UserStorage<UserStorageConfig> | null;

  public static getInstance(logger: LogFunctions): UserAccountManager {
    if (UserAccountManager.instance === null) {
      logger.debug("Creating User Account Manager instance.");
      UserAccountManager.instance = new UserAccountManager(logger);
    } else {
      logger.debug("User Account Manager instance already exists.");
    }
    return UserAccountManager.instance;
  }

  private constructor(logger: LogFunctions) {
    this.logger = logger;
    this.userStorage = null;
  }

  public isStorageInitialised(): boolean {
    return this.userStorage !== null;
  }

  public initialiseStorage(storageConfig: UserStorageConfig): void {
    this.logger.info("Initialising user storage.");
    if (this.userStorage !== null) {
      throw new Error("Cannot initialise a new user storage when one already exists! Close exisitng storage before initialising a new one");
    }
    try {
      this.userStorage = userStorageFactory(storageConfig, this.logger);
    } catch (err: unknown) {
      // Make sure the storage is left uninitialised on error
      this.userStorage = null;
      throw err;
    }
  }

  public closeStorage(): boolean {
    if (this.userStorage === null) {
      throw new Error("Cannot close uninitialised user storage! To close the user storage, it must be initialised");
    }
    this.logger.info(`Closing "${this.userStorage.config.type}" user storage.`);
    const CLOSE_RESULT: boolean = this.userStorage.close();
    this.userStorage = null;
    this.logger.debug(CLOSE_RESULT ? "Closed user storage." : "Could not close user storage.");
    return CLOSE_RESULT;
  }
}
