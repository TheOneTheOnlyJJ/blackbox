import { LogFunctions } from "electron-log";
import { UserStorage } from "./storage/UserStorage";
import { UserStorageConfig } from "./storage/utils";
import { userStorageFactory } from "./storage/userStorageFactory";
import { UserStorageType } from "./storage/UserStorageType";
import { IBaseNewUserData, BASE_NEW_USER_DATA_JSON_SCHEMA } from "../../shared/user/IBaseNewUserData";
import { ValidateFunction } from "ajv";
import { createJSONValidateFunction } from "../utils/config/config";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { ISecuredNewUserData } from "./ISecuredNewUserData";

type UserStorageAvailabilityChangeCallbackType = (isAvailable: boolean) => void;

export class UserAccountManager {
  private readonly logger: LogFunctions;

  // User storage
  private userStorage: UserStorage<UserStorageConfig> | null;
  // This is needed to let the renderer know if the user storage is available when it changes
  private onUserStorageAvailabilityChangeCallback: UserStorageAvailabilityChangeCallbackType;

  // Validators
  private readonly NEW_USER_BASE_DATA_VALIDATOR: ValidateFunction<IBaseNewUserData> =
    createJSONValidateFunction<IBaseNewUserData>(BASE_NEW_USER_DATA_JSON_SCHEMA);

  public constructor(onUserStorageAvailabilityChangeCallback: UserStorageAvailabilityChangeCallbackType, logger: LogFunctions) {
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

  public isBaseNewUserDataValid(userData: IBaseNewUserData): boolean {
    if (!this.NEW_USER_BASE_DATA_VALIDATOR(userData)) {
      this.logger.error(`Invalid new user base data!`);
      this.NEW_USER_BASE_DATA_VALIDATOR.errors?.map((error) => {
        this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
      });
      return false;
    }
    this.logger.debug("Valid new user base data.");
    return true;
  }

  public secureBaseNewUserData(baseUserData: IBaseNewUserData): ISecuredNewUserData {
    this.logger.debug("Securing new user base data.");
    const START_TIME: [number, number] = process.hrtime();
    const PASSWORD_SALT: Buffer = randomBytes(16);
    const SECURED_USER_DATA: ISecuredNewUserData = {
      id: randomUUID({ disableEntropyCache: true }),
      username: baseUserData.username,
      // TODO: Change scrypt to argon2 once it becomes available
      passwordHash: scryptSync(baseUserData.password, PASSWORD_SALT, 64).toString("hex"),
      passwordSalt: PASSWORD_SALT.toString("hex")
    };
    const END_TIME: [number, number] = process.hrtime(START_TIME);
    this.logger.debug(`Done securing new user data. Time taken: ${END_TIME[0].toString()} seconds & ${END_TIME[1].toString()} nanoseconds.`);
    return SECURED_USER_DATA;
  }

  public registerUser(userData: ISecuredNewUserData): boolean {
    if (this.userStorage === null) {
      throw new Error("Cannot register a new user without an open user storage");
    }
    return this.userStorage.addUser(userData);
  }
}
