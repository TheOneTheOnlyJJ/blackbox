import { LogFunctions } from "electron-log";
import { UserAccountStorage } from "./account/storage/UserAccountStorage";
import { userAccountStorageFactory } from "./account/storage/userAccountStorageFactory";
import { UserAccountStorageType } from "./account/storage/UserAccountStorageType";
import { BASE_NEW_USER_DATA_JSON_SCHEMA, IBaseNewUserData } from "../../shared/user/IBaseNewUserData";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, UUID } from "node:crypto";
import { ISecuredNewUserData } from "./account/ISecuredNewUserData";
import { CURRENTLY_SIGNED_IN_USER_SCHEMA, ICurrentlySignedInUser } from "../../shared/user/ICurrentlySignedInUser";
import { IUserSignInCredentials, USER_SIGN_IN_CREDENTIALS_JSON_SCHEMA } from "../../shared/user/IUserSignInCredentials";
import { CurrentlySignedInUserChangeCallback, UserAccountStorageAvailabilityChangeCallback } from "../../shared/IPC/APIs/IUserAPI";
import { isDeepStrictEqual } from "node:util";
import Ajv, { ValidateFunction } from "ajv";
import { UserAccountStorageConfig } from "./account/storage/UserAccountStorageConfig";
import { UserDataStorageConfig } from "./data/storage/UserDataStorageConfig";

export class UserManager {
  private readonly logger: LogFunctions;
  private readonly userAccountStorageLogger: LogFunctions;

  // Currently signed in user
  // Must be wrapped in an object because it is a proxy
  private currentlySignedInUser: { value: ICurrentlySignedInUser | null };
  public onCurrentlySignedInUserChangeCallback: CurrentlySignedInUserChangeCallback;

  // User Account Storage
  // Must be wrapped in an object because it too is a proxy
  private userAccountStorage: { value: UserAccountStorage<UserAccountStorageConfig> | null };
  // This is needed to let the renderer know if the User Account Storage is available when it changes
  public onUserAccountStorageAvailabilityChangeCallback: UserAccountStorageAvailabilityChangeCallback;

  // AJV insatnce
  private readonly AJV: Ajv;
  // AJV Validate functions
  public readonly BASE_NEW_USER_DATA_VALIDATE_FUNCTION: ValidateFunction<IBaseNewUserData>;
  public readonly USER_SIGN_IN_CREDENTIALS_VALIDATE_FUNCTION: ValidateFunction<IUserSignInCredentials>;
  public readonly CURRENTLY_SIGNED_IN_USER_VALIDATE_FUNCTION: ValidateFunction<ICurrentlySignedInUser>;

  public constructor(logger: LogFunctions, userAccountStorageLogger: LogFunctions, ajv: Ajv) {
    // Loggers
    this.logger = logger;
    this.logger.debug("Initialising new User Manager.");
    this.userAccountStorageLogger = userAccountStorageLogger;
    // AJV and validators
    this.AJV = ajv;
    this.BASE_NEW_USER_DATA_VALIDATE_FUNCTION = this.AJV.compile<IBaseNewUserData>(BASE_NEW_USER_DATA_JSON_SCHEMA);
    this.USER_SIGN_IN_CREDENTIALS_VALIDATE_FUNCTION = this.AJV.compile<IUserSignInCredentials>(USER_SIGN_IN_CREDENTIALS_JSON_SCHEMA);
    this.CURRENTLY_SIGNED_IN_USER_VALIDATE_FUNCTION = this.AJV.compile<ICurrentlySignedInUser>(CURRENTLY_SIGNED_IN_USER_SCHEMA);
    // Currently signed in user
    this.onCurrentlySignedInUserChangeCallback = (): void => {
      this.logger.debug("No currently signed in user change callback set.");
    };
    // Currently signed in user proxy that performs validation and calls the change callback when required
    this.currentlySignedInUser = new Proxy<{ value: ICurrentlySignedInUser | null }>(
      { value: null },
      {
        set: (target: { value: ICurrentlySignedInUser | null }, property: string | symbol, value: unknown): boolean => {
          if (property !== "value") {
            this.logger.error(`Cannot set property "${String(property)}" on currently signed in user. Only "value" property can be set! No-op set.`);
            return false;
          }
          if (value !== null && !this.CURRENTLY_SIGNED_IN_USER_VALIDATE_FUNCTION(value)) {
            this.logger.error(`Value must be "null" or a valid currently signed in user object! No-op set.`);
            return false;
          }
          if (isDeepStrictEqual(target[property], value)) {
            this.logger.warn(`Currently signed in user already had this value: "${JSON.stringify(value, null, 2)}". No-op set.`);
            return false;
          }
          target[property] = value;
          if (value === null) {
            this.logger.info('Currently signed in user set to "null" (signed out).');
          } else {
            this.logger.info(`Currently signed in user set to: ${JSON.stringify(value, null, 2)} (signed in).`);
          }
          this.onCurrentlySignedInUserChangeCallback(value);
          return true;
        }
      }
    );
    // User Account Storage
    this.onUserAccountStorageAvailabilityChangeCallback = (): void => {
      this.logger.debug("No User Account Storage availability change callback set.");
    };
    // User Account Storage proxy that performs validation and calls the change callback when required
    this.userAccountStorage = new Proxy<{ value: UserAccountStorage<UserAccountStorageConfig> | null }>(
      { value: null },
      {
        set: (target: { value: UserAccountStorage<UserAccountStorageConfig> | null }, property: string | symbol, value: unknown): boolean => {
          if (property !== "value") {
            this.logger.error(`Cannot set property "${String(property)}" on User Account Storage. Only "value" property can be set! No-op set.`);
            return false;
          }
          if (value !== null && !(value instanceof UserAccountStorage)) {
            this.logger.error(`Value must be "null" or an instance of User Account Storage! No-op set.`);
            return false;
          }
          target[property] = value;
          if (value === null) {
            this.logger.info('User Account Storage set to "null" (unavailable).');
            this.onUserAccountStorageAvailabilityChangeCallback(false);
          } else {
            this.logger.info(`User Account Storage set to User Account Storage with config: ${JSON.stringify(value.config, null, 2)} (available).`);
            this.onUserAccountStorageAvailabilityChangeCallback(true);
          }
          return true;
        }
      }
    );
  }

  public getUserAccountStorageType(): UserAccountStorageType {
    this.logger.debug("Getting User Account Storage type.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.config.type;
  }

  public isUserAccountStorageAvailable(): boolean {
    this.logger.debug("Getting User Account Storage availability.");
    return this.userAccountStorage.value !== null;
  }

  public openUserAccountStorage(storageConfig: UserAccountStorageConfig): boolean {
    this.logger.debug(`Opening User Account Storage.`);
    if (this.userAccountStorage.value !== null) {
      if (isDeepStrictEqual(this.userAccountStorage.value.config, storageConfig)) {
        this.logger.debug("This exact User Account Storage is already open. No-op.");
        return false;
      }
      this.logger.debug(`Previous "${this.userAccountStorage.value.config.type}" User Account Storage still open. Closing before opening new one.`);
      const IS_PREVIOUS_USER_ACCOUNT_STORAGE_CLOSED: boolean = this.closeUserAccountStorage();
      if (!IS_PREVIOUS_USER_ACCOUNT_STORAGE_CLOSED) {
        this.logger.warn(`Could not close previous "${this.userAccountStorage.value.config.type}" User Account Storage. No-op.`);
        return false;
      }
    }
    try {
      this.userAccountStorage.value = userAccountStorageFactory(storageConfig, this.userAccountStorageLogger, this.AJV);
      this.logger.debug(`Opened "${this.userAccountStorage.value.config.type}" User Account Storage.`);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not open "${storageConfig.type}" User Account Storage: ${ERROR_MESSAGE}!`);
      this.userAccountStorage.value = null;
      return false;
    }
  }

  public closeUserAccountStorage(): boolean {
    this.logger.debug("Closing User Account Storage.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    let isUserStorageClosed: boolean;
    try {
      isUserStorageClosed = this.userAccountStorage.value.close();
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not close "${this.userAccountStorage.value.config.type}" User Account Storage: ${ERROR_MESSAGE}!`);
      return false;
    }
    if (isUserStorageClosed) {
      this.logger.debug(`Closed "${this.userAccountStorage.value.config.type}" User Account Storage.`);
      this.userAccountStorage.value = null;
    } else {
      this.logger.warn(`Could not close "${this.userAccountStorage.value.config.type}" User Account Storage.`);
    }
    return isUserStorageClosed;
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Getting username availability for username: "${username}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.isUsernameAvailable(username);
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
      userId: randomUUID({ disableEntropyCache: true }),
      username: baseNewUserData.username,
      passwordHash: PASSWORD_HASH,
      passwordSalt: PASSWORD_SALT
    };
    this.logger.debug("Done securing base new user data.");
    return SECURED_USER_DATA;
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.getUserCount();
  }

  public signUpUser(userData: ISecuredNewUserData): boolean {
    this.logger.debug(`Signing up user: "${userData.username}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.addUser(userData);
  }

  public signInUser(userSignInCredentials: IUserSignInCredentials): boolean {
    this.logger.debug(`Attempting sign in for user: "${userSignInCredentials.username}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    const USER_ID: UUID | null = this.userAccountStorage.value.getUserId(userSignInCredentials.username);
    if (USER_ID === null) {
      this.logger.debug("No user ID for given username. Username must be missing from storage. Sign in failed.");
      return false;
    }
    const USER_PASSWORD_DATA: [Buffer, Buffer] | null = this.userAccountStorage.value.getPasswordData(USER_ID);
    if (USER_PASSWORD_DATA === null) {
      throw new Error(`No password hash and salt for user with ID: "${USER_ID}"`);
    }
    const [USER_PASSWORD_HASH, USER_PASSWORD_SALT]: [Buffer, Buffer] = USER_PASSWORD_DATA;
    const SIGN_IN_PASSWORD_HASH: Buffer = this.hashPassword(userSignInCredentials.password, USER_PASSWORD_SALT);
    if (timingSafeEqual(SIGN_IN_PASSWORD_HASH, USER_PASSWORD_HASH)) {
      this.logger.debug("Password hashed matched! Signing in.");
      this.currentlySignedInUser.value = { userId: USER_ID, username: userSignInCredentials.username };
      return true;
    }
    this.logger.debug("Password hashes do not match. Sign in failed.");
    return false;
  }

  public signOutUser(): void {
    this.logger.debug("Attempting sign out.");
    if (this.currentlySignedInUser.value === null) {
      this.logger.debug("No signed in user. No-op.");
      return;
    }
    this.logger.debug(`Signing out user: "${this.currentlySignedInUser.value.username}".`);
    this.currentlySignedInUser.value = null;
  }

  public getCurrentlySignedInUser(): ICurrentlySignedInUser | null {
    return this.currentlySignedInUser.value;
  }

  public addUserDataStorageConfig(userId: UUID, userDataStorageConfig: UserDataStorageConfig): boolean {
    this.logger.debug(`Adding new User Data Storage Config to user with ID: "${userId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.addUserDataStorageConfig(userId, userDataStorageConfig);
  }

  public getAllUserDataStorageConfigs(userId: UUID): UserDataStorageConfig[] {
    this.logger.debug(`Getting all User Data Storage Configs for user with ID: "${userId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.getAllUserDataStorageConfigs(userId);
  }
}
