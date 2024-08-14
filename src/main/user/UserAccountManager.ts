import { LogFunctions } from "electron-log";
import { UserStorage } from "./storage/UserStorage";
import { UserStorageConfig } from "./storage/utils";
import { userStorageFactory } from "./storage/userStorageFactory";
import { UserStorageType } from "./storage/UserStorageType";

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

  public getStorageType(): UserStorageType {
    if (this.userStorage === null) {
      throw new Error("Cannot get user storage type for uninitialised user storage! Initialise a storage to be able to access its type");
    }
    return this.userStorage.config.type;
  }

  public isStorageInitialised(): boolean {
    return this.userStorage !== null;
  }

  public initialiseStorage(storageConfig: UserStorageConfig): void {
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
    const IS_USER_STORAGE_CLOSED: boolean = this.userStorage.close();
    this.userStorage = null;
    return IS_USER_STORAGE_CLOSED;
  }
}
