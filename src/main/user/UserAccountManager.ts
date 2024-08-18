import { LogFunctions } from "electron-log";
import { UserStorage } from "./storage/UserStorage";
import { UserStorageConfig } from "./storage/utils";
import { userStorageFactory } from "./storage/userStorageFactory";
import { UserStorageType } from "./storage/UserStorageType";
import { IUser } from "./IUser";

type StorageChangeCallbackType = (isAvailable: boolean) => void;

export class UserAccountManager {
  private readonly logger: LogFunctions;
  private userStorage: UserStorage<UserStorageConfig> | null;
  // This is needed to let the renderer know if the user storage is available when it changes
  private onUserStorageAvailabilityChangeCallback: StorageChangeCallbackType;

  public constructor(onUserStorageAvailabilityChangeCallback: StorageChangeCallbackType, logger: LogFunctions) {
    this.logger = logger;
    this.logger.debug("Creating new User Account Manager.");
    this.userStorage = null;
    this.onUserStorageAvailabilityChangeCallback = onUserStorageAvailabilityChangeCallback;
  }

  public getStorageType(): UserStorageType {
    if (this.userStorage === null) {
      throw new Error("Cannot get user storage type from unopened user storage! Open a storage to be able to access its type");
    }
    return this.userStorage.config.type;
  }

  public isStorageAvailable(): boolean {
    return this.userStorage !== null;
  }

  public openStorage(storageConfig: UserStorageConfig): void {
    if (this.userStorage !== null) {
      throw new Error("Cannot open a new user storage when one is already opened! Close exisitng storage before opening a new one");
    }
    try {
      this.userStorage = userStorageFactory(storageConfig, this.logger);
    } catch (err: unknown) {
      // Make sure the storage is left uninitialised (closed) on error
      this.userStorage = null;
      throw err;
    } finally {
      this.onUserStorageAvailabilityChangeCallback(this.isStorageAvailable());
    }
  }

  public closeStorage(): boolean {
    if (this.userStorage === null) {
      throw new Error("Cannot close unopened user storage! To close the user storage, it must be opened");
    }
    const IS_USER_STORAGE_CLOSED: boolean = this.userStorage.close();
    this.userStorage = null;
    this.onUserStorageAvailabilityChangeCallback(false);
    return IS_USER_STORAGE_CLOSED;
  }

  public isUsernameAvailable(username: string): boolean {
    if (this.userStorage === null) {
      throw new Error("Cannot check username availability with unopened user storage! Open one before checking");
    }
    return this.userStorage.isUsernameAvailable(username);
  }

  public registerUser(userData: IUser): boolean {
    if (this.userStorage === null) {
      throw new Error("Cannot register user with ");
    }
    return this.userStorage.addUser(userData);
  }
}
