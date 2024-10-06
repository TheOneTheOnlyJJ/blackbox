import { LogFunctions } from "electron-log";
import { UserStorage } from "./storage/UserStorage";
import { UserStorageConfig, userStorageFactory } from "./storage/userStorageFactory";
import { UserStorageType } from "./storage/UserStorageType";
import { BASE_NEW_USER_DATA_JSON_SCHEMA, IBaseNewUserData } from "../../shared/user/IBaseNewUserData";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, UUID } from "node:crypto";
import { ISecuredNewUserData } from "./ISecuredNewUserData";
import { ICurrentlySignedInUser } from "../../shared/user/ICurrentlySignedInUser";
import { IUserSignInCredentials, USER_SIGN_IN_CREDENTIALS_JSON_SCHEMA } from "../../shared/user/IUserSignInCredentials";
import { CurrentlySignedInUserChangeCallback, UserStorageAvailabilityChangeCallback } from "../../shared/IPC/APIs/IUserAPI";
import { isDeepStrictEqual } from "node:util";
import { createJSONValidateFunction } from "../utils/config/config";
import { ValidateFunction } from "ajv";

export class UserAccountManager {
  private readonly logger: LogFunctions;
  private readonly userStorageLogger: LogFunctions;

  // Currently signed in user
  private currentlySignedInUser: ICurrentlySignedInUser | null;
  private onCurrentlySignedInUserChangeCallback: CurrentlySignedInUserChangeCallback;

  // User storage
  private userStorage: UserStorage<UserStorageConfig> | null;
  // This is needed to let the renderer know if the user storage is available when it changes
  private onUserStorageAvailabilityChangeCallback: UserStorageAvailabilityChangeCallback;

  // AJV Validate functions
  public readonly BASE_NEW_USER_DATA_VALIDATE_FUNCTION: ValidateFunction<IBaseNewUserData> =
    createJSONValidateFunction<IBaseNewUserData>(BASE_NEW_USER_DATA_JSON_SCHEMA);
  public readonly USER_SIGN_IN_CREDENTIALS_VALIDATE_FUNCTION: ValidateFunction<IUserSignInCredentials> =
    createJSONValidateFunction<IUserSignInCredentials>(USER_SIGN_IN_CREDENTIALS_JSON_SCHEMA);

  public constructor(
    onCurrentlySignedInUserChangeCallback: CurrentlySignedInUserChangeCallback,
    onUserStorageAvailabilityChangeCallback: UserStorageAvailabilityChangeCallback,
    logger: LogFunctions,
    userStorageLogger: LogFunctions
  ) {
    this.logger = logger;
    this.logger.debug("Creating new User Account Manager.");
    this.userStorageLogger = userStorageLogger;
    this.currentlySignedInUser = null;
    this.onCurrentlySignedInUserChangeCallback = onCurrentlySignedInUserChangeCallback;
    this.userStorage = null;
    this.onUserStorageAvailabilityChangeCallback = onUserStorageAvailabilityChangeCallback;
  }

  public getUserStorageType(): UserStorageType {
    this.logger.debug("Getting user storage type.");
    if (this.userStorage === null) {
      throw new Error("Null user storage");
    }
    return this.userStorage.getConfig().type;
  }

  public isUserStorageAvailable(): boolean {
    this.logger.debug("Getting user storage availability.");
    return this.userStorage !== null;
  }

  public openUserStorage(storageConfig: UserStorageConfig): void {
    this.logger.debug(`Opening user storage of type: ${storageConfig.type}.`);
    if (this.userStorage !== null) {
      if (isDeepStrictEqual(this.userStorage.getConfig(), storageConfig)) {
        this.logger.debug("This exact user storage is already open. No-op.");
        return;
      }
      this.logger.debug(`User storage (of type ${this.userStorage.getConfig().type}) already open. Closing before opening new one.`);
      this.closeUserStorage();
    }
    try {
      this.userStorage = userStorageFactory(storageConfig, this.userStorageLogger);
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not open user storage: ${ERROR_MESSAGE}!`);
      this.userStorage = null;
      throw err;
    } finally {
      this.onUserStorageAvailabilityChangeCallback(this.isUserStorageAvailable());
    }
  }

  public closeUserStorage(): boolean {
    this.logger.debug("Closing user storage.");
    if (this.userStorage === null) {
      throw new Error("Null user storage");
    }
    let isUserStorageClosed: boolean;
    try {
      isUserStorageClosed = this.userStorage.close();
      if (isUserStorageClosed) {
        this.userStorage = null;
      }
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not close user storage: ${ERROR_MESSAGE}!`);
      this.userStorage = null;
      isUserStorageClosed = false;
      throw err;
    } finally {
      this.onUserStorageAvailabilityChangeCallback(this.isUserStorageAvailable());
    }
    return isUserStorageClosed;
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Getting username availability for username: "${username}".`);
    if (this.userStorage === null) {
      throw new Error("Null user storage");
    }
    return this.userStorage.isUsernameAvailable(username);
  }

  private hashPassword(plainTextPassword: string, salt: Buffer): Buffer {
    this.logger.debug("Hashing password.");
    // TODO: Change scrypt to argon2 once it becomes available
    return scryptSync(plainTextPassword, salt, 64);
  }

  public secureBaseNewUserData(baseNewUserData: IBaseNewUserData): ISecuredNewUserData {
    this.logger.debug(`Securing base new user data for user: "${baseNewUserData.username}".`);
    const PASSWORD_SALT: Buffer = randomBytes(16);
    const PASSWORD_HASH: Buffer = this.hashPassword(baseNewUserData.password, PASSWORD_SALT);
    const SECURED_USER_DATA: ISecuredNewUserData = {
      id: randomUUID({ disableEntropyCache: true }),
      username: baseNewUserData.username,
      passwordHash: PASSWORD_HASH,
      passwordSalt: PASSWORD_SALT
    };
    this.logger.debug("Done securing base new user data.");
    return SECURED_USER_DATA;
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    if (this.userStorage === null) {
      throw new Error("Null user storage");
    }
    return this.userStorage.getUserCount();
  }

  public signUpUser(userData: ISecuredNewUserData): boolean {
    this.logger.debug(`Signing up user: "${userData.username}".`);
    if (this.userStorage === null) {
      throw new Error("Null user storage");
    }
    return this.userStorage.addUser(userData);
  }

  public signInUser(userSignInCredentials: IUserSignInCredentials): boolean {
    this.logger.debug(`Signing in "${userSignInCredentials.username}".`);
    if (this.userStorage === null) {
      throw new Error("Null user storage");
    }
    const USER_ID: UUID | null = this.userStorage.getUserIdByUsername(userSignInCredentials.username);
    if (USER_ID === null) {
      this.logger.debug("No user ID for given username. Username must be missing from storage. Sign in failed.");
      return false;
    }
    const USER_PASSWORD_DATA: [Buffer, Buffer] | null = this.userStorage.getPasswordDataByUserId(USER_ID);
    if (USER_PASSWORD_DATA === null) {
      throw new Error(`No password hash and salt for user with ID: "${USER_ID}"!`);
    }
    const [USER_PASSWORD_HASH, USER_PASSWORD_SALT]: [Buffer, Buffer] = USER_PASSWORD_DATA;
    const SIGN_IN_PASSWORD_HASH: Buffer = this.hashPassword(userSignInCredentials.password, USER_PASSWORD_SALT);
    if (timingSafeEqual(SIGN_IN_PASSWORD_HASH, USER_PASSWORD_HASH)) {
      this.currentlySignedInUser = { id: USER_ID, username: userSignInCredentials.username };
      this.onCurrentlySignedInUserChangeCallback(this.currentlySignedInUser);
      this.logger.debug(`Signed in "${this.currentlySignedInUser.username}".`);
      return true;
    }
    this.logger.debug("Password hashes do not match. Sign in failed.");
    return false;
  }

  public signOutUser(): void {
    this.logger.debug("Signing out.");
    if (this.currentlySignedInUser === null) {
      this.logger.debug("No signed in user. No-op.");
      return;
    }
    const SIGNED_OUT_USER_USERNAME: string = this.currentlySignedInUser.username;
    this.currentlySignedInUser = null;
    this.onCurrentlySignedInUserChangeCallback(this.currentlySignedInUser);
    this.logger.debug(`Signing out "${SIGNED_OUT_USER_USERNAME}".`);
  }

  public getCurrentlySignedInUser(): ICurrentlySignedInUser | null {
    return this.currentlySignedInUser;
  }
}
