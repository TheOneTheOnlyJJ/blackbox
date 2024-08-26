import { LogFunctions } from "electron-log";
import { UserStorage } from "./storage/UserStorage";
import { UserStorageConfig } from "./storage/utils";
import { userStorageFactory } from "./storage/userStorageFactory";
import { UserStorageType } from "./storage/UserStorageType";
import { IBaseNewUserData, BASE_NEW_USER_DATA_JSON_SCHEMA } from "../../shared/user/IBaseNewUserData";
import { ValidateFunction } from "ajv";
import { createJSONValidateFunction } from "../utils/config/config";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, UUID } from "node:crypto";
import { ISecuredNewUserData } from "./ISecuredNewUserData";
import { ICurrentlyLoggedInUser } from "../../shared/user/ICurrentlyLoggedInUser";
import { IUserLoginCredentials } from "../../shared/user/IUserLoginCredentials";
import { CurrentlyLoggedInUserChangeCallback, UserStorageAvailabilityChangeCallback } from "../../shared/IPC/APIs/IUserAPI";

export class UserAccountManager {
  private readonly logger: LogFunctions;

  // Currently logged in user
  private currentlyLoggedInUser: ICurrentlyLoggedInUser | null;
  private onCurrentlyLoggedInUserChangeCallback: CurrentlyLoggedInUserChangeCallback;

  // User storage
  private userStorage: UserStorage<UserStorageConfig> | null;
  // This is needed to let the renderer know if the user storage is available when it changes
  private onUserStorageAvailabilityChangeCallback: UserStorageAvailabilityChangeCallback;

  // Validators
  private readonly NEW_USER_BASE_DATA_VALIDATOR: ValidateFunction<IBaseNewUserData> =
    createJSONValidateFunction<IBaseNewUserData>(BASE_NEW_USER_DATA_JSON_SCHEMA);

  public constructor(
    onCurrentlyLoggedInUserChangeCallback: CurrentlyLoggedInUserChangeCallback,
    onUserStorageAvailabilityChangeCallback: UserStorageAvailabilityChangeCallback,
    logger: LogFunctions
  ) {
    this.logger = logger;
    this.logger.debug("Creating new User Account Manager.");
    this.currentlyLoggedInUser = null;
    this.onCurrentlyLoggedInUserChangeCallback = onCurrentlyLoggedInUserChangeCallback;
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

  private hashPassword(plainTextPassword: string, salt: Buffer): Buffer {
    this.logger.debug("Hashing password.");
    // TODO: Change scrypt to argon2 once it becomes available
    return scryptSync(plainTextPassword, salt, 64);
  }

  public secureBaseNewUserData(baseUserData: IBaseNewUserData): ISecuredNewUserData {
    this.logger.debug("Securing new user base data.");
    const PASSWORD_SALT: Buffer = randomBytes(16);
    const PASSWORD_HASH: Buffer = this.hashPassword(baseUserData.password, PASSWORD_SALT);
    const SECURED_USER_DATA: ISecuredNewUserData = {
      id: randomUUID({ disableEntropyCache: true }),
      username: baseUserData.username,
      passwordHash: PASSWORD_HASH,
      passwordSalt: PASSWORD_SALT
    };
    this.logger.debug("Done securing new user data.");
    return SECURED_USER_DATA;
  }

  public registerUser(userData: ISecuredNewUserData, loginIfSuccessful: boolean): boolean {
    if (this.userStorage === null) {
      throw new Error("Cannot register a new user without an open user storage");
    }
    const HAS_REGISTERED_SUCCESSFULLY: boolean = this.userStorage.addUser(userData);
    if (HAS_REGISTERED_SUCCESSFULLY && loginIfSuccessful) {
      if (this.currentlyLoggedInUser !== null) {
        this.logger.error("Cannot login newly registered user while a user is already logged in");
        return HAS_REGISTERED_SUCCESSFULLY;
      }
      this.currentlyLoggedInUser = { id: userData.id, username: userData.username };
      this.onCurrentlyLoggedInUserChangeCallback(this.currentlyLoggedInUser);
      this.logger.info(`Logged in user: "${this.currentlyLoggedInUser.username}".`);
    }
    return HAS_REGISTERED_SUCCESSFULLY;
  }

  public getUserCount(): number {
    if (this.userStorage === null) {
      throw new Error("Cannot get user count without an open user storage");
    }
    return this.userStorage.getUserCount();
  }

  public isAnyUserLoggedIn(): boolean {
    this.logger.debug("Checking if any user is logged in.");
    return this.currentlyLoggedInUser !== null;
  }

  public loginUser(loginCredentials: IUserLoginCredentials): boolean {
    this.logger.debug(`Logging in user: "${loginCredentials.username}".`);
    if (this.userStorage === null) {
      throw new Error("Cannot login user without an open user storage");
    }
    if (this.currentlyLoggedInUser !== null) {
      throw new Error("Cannot login user while a user is already logged in");
    }
    const USER_ID: UUID | null = this.userStorage.getUserIdByUsername(loginCredentials.username);
    if (USER_ID === null) {
      this.logger.debug("Could not find user ID for given username. Username must be missing from storage. Login failed.");
      return false;
    }
    const USER_PASSWORD_DATA: [Buffer, Buffer] | null = this.userStorage.getPasswordDataByUserId(USER_ID);
    if (USER_PASSWORD_DATA === null) {
      this.logger.error(`Could not find password hash and salt for user with ID: "${USER_ID}". This should be investigated. Login failed.`);
      return false;
    }
    const [USER_PASSWORD_HASH, USER_PASSWORD_SALT]: [Buffer, Buffer] = USER_PASSWORD_DATA;
    const LOGIN_PASSWORD_HASH: Buffer = this.hashPassword(loginCredentials.password, USER_PASSWORD_SALT);
    if (timingSafeEqual(LOGIN_PASSWORD_HASH, USER_PASSWORD_HASH)) {
      this.currentlyLoggedInUser = { id: USER_ID, username: loginCredentials.username };
      this.onCurrentlyLoggedInUserChangeCallback(this.currentlyLoggedInUser);
      this.logger.info(`Logged in user: "${this.currentlyLoggedInUser.username}".`);
      return true;
    }
    this.logger.debug("Password hashes do not match. Login failed.");
    return false;
  }

  public logoutUser(): void {
    if (this.currentlyLoggedInUser === null) {
      throw new Error("Cannot logout user while no user is logged in");
    }
    this.logger.debug(`Logging out user: "${this.currentlyLoggedInUser.username}".`);
    this.currentlyLoggedInUser = null;
    this.onCurrentlyLoggedInUserChangeCallback(this.currentlyLoggedInUser);
  }
}
