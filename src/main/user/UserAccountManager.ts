import { LogFunctions } from "electron-log";
import { UserStorage } from "./storage/UserStorage";
import { UserStorageConfig } from "./storage/utils";
import { userStorageFactory } from "./storage/userStorageFactory";
import { UserStorageType } from "./storage/UserStorageType";

export type UserStorageChangeCallback = (isAvailable: boolean) => void;

export class UserAccountManager {
  private static instance: null | UserAccountManager = null;

  private readonly logger: LogFunctions;
  private userStorage: UserStorage<UserStorageConfig> | null;
  // This is needed to let the renderer know if the user storage is available when it changes
  private userStorageChangeCallback: UserStorageChangeCallback;

  public static getInstance(userStorageChangeCallback: UserStorageChangeCallback, logger: LogFunctions): UserAccountManager {
    if (UserAccountManager.instance === null) {
      logger.debug("Creating User Account Manager instance.");
      UserAccountManager.instance = new UserAccountManager(userStorageChangeCallback, logger);
    } else {
      logger.debug("User Account Manager instance already exists.");
    }
    return UserAccountManager.instance;
  }

  private constructor(userStorageChangeCallback: UserStorageChangeCallback, logger: LogFunctions) {
    this.logger = logger;
    this.userStorage = null;
    this.userStorageChangeCallback = userStorageChangeCallback;
  }

  public getStorageType(): UserStorageType {
    if (this.userStorage === null) {
      throw new Error("Cannot get user storage type for unopened user storage! Open a storage to be able to access its type");
    }
    return this.userStorage.config.type;
  }

  public isStorageAvailable(): boolean {
    return this.userStorage !== null;
  }

  public openStorage(storageConfig: UserStorageConfig): void {
    if (this.userStorage !== null) {
      throw new Error("Cannot open a new user storage when one already exists! Close exisitng storage before opening a new one");
    }
    try {
      this.userStorage = userStorageFactory(storageConfig, this.logger);
    } catch (err: unknown) {
      // Make sure the storage is left uninitialised on error
      this.userStorage = null;
      throw err;
    } finally {
      this.userStorageChangeCallback(this.isStorageAvailable());
    }
  }

  public closeStorage(): boolean {
    if (this.userStorage === null) {
      throw new Error("Cannot close inexistent user storage! To close the user storage, it must be opened");
    }
    const IS_USER_STORAGE_CLOSED: boolean = this.userStorage.close();
    this.userStorage = null;
    this.userStorageChangeCallback(false);
    return IS_USER_STORAGE_CLOSED;
  }

  public isUsernameAvailable(username: string) {
    if (this.userStorage === null) {
      throw new Error("Cannot check username availability with inexistent user storage! Open one before checking!");
    }
    return this.userStorage.isUsernameAvailable(username);
  }
}
