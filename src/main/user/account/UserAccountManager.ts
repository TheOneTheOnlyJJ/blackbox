import { LogFunctions } from "electron-log";
import { UserAccountStorage } from "./storage/UserAccountStorage";
import { UserAccountStorageConfig, userAccountStorageFactory } from "./storage/userAccountStorageFactory";
import { UserAccountStorageType } from "./storage/UserAccountStorageType";
import { BASE_NEW_USER_DATA_JSON_SCHEMA, IBaseNewUserData } from "../../../shared/user/IBaseNewUserData";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, UUID } from "node:crypto";
import { ISecuredNewUserData } from "./ISecuredNewUserData";
import { ICurrentlySignedInUser } from "../../../shared/user/ICurrentlySignedInUser";
import { IUserSignInCredentials, USER_SIGN_IN_CREDENTIALS_JSON_SCHEMA } from "../../../shared/user/IUserSignInCredentials";
import { CurrentlySignedInUserChangeCallback, UserAccountStorageAvailabilityChangeCallback } from "../../../shared/IPC/APIs/IUserAPI";
import { isDeepStrictEqual } from "node:util";
import Ajv, { ValidateFunction } from "ajv";

export class UserAccountManager {
  private readonly logger: LogFunctions;
  private readonly userAccountStorageLogger: LogFunctions;

  // Currently signed in user
  private currentlySignedInUser: ICurrentlySignedInUser | null;
  private onCurrentlySignedInUserChangeCallback: CurrentlySignedInUserChangeCallback;

  // User account storage
  private userAccountStorage: UserAccountStorage<UserAccountStorageConfig> | null;
  // This is needed to let the renderer know if the user account storage is available when it changes
  private onUserAccountStorageAvailabilityChangeCallback: UserAccountStorageAvailabilityChangeCallback;

  // AJV insatnce
  private readonly AJV: Ajv;
  // AJV Validate functions
  public readonly BASE_NEW_USER_DATA_VALIDATE_FUNCTION: ValidateFunction<IBaseNewUserData>;
  public readonly USER_SIGN_IN_CREDENTIALS_VALIDATE_FUNCTION: ValidateFunction<IUserSignInCredentials>;

  public constructor(
    onCurrentlySignedInUserChangeCallback: CurrentlySignedInUserChangeCallback,
    onUserAccountStorageAvailabilityChangeCallback: UserAccountStorageAvailabilityChangeCallback,
    logger: LogFunctions,
    userAccountStorageLogger: LogFunctions,
    ajv: Ajv
  ) {
    this.logger = logger;
    this.logger.debug("Initialising new User Account Manager.");
    this.userAccountStorageLogger = userAccountStorageLogger;
    this.currentlySignedInUser = null;
    this.onCurrentlySignedInUserChangeCallback = onCurrentlySignedInUserChangeCallback;
    this.userAccountStorage = null;
    this.onUserAccountStorageAvailabilityChangeCallback = onUserAccountStorageAvailabilityChangeCallback;
    this.AJV = ajv;
    this.BASE_NEW_USER_DATA_VALIDATE_FUNCTION = this.AJV.compile<IBaseNewUserData>(BASE_NEW_USER_DATA_JSON_SCHEMA);
    this.USER_SIGN_IN_CREDENTIALS_VALIDATE_FUNCTION = this.AJV.compile<IUserSignInCredentials>(USER_SIGN_IN_CREDENTIALS_JSON_SCHEMA);
  }

  public getUserAccountStorageType(): UserAccountStorageType {
    this.logger.debug("Getting User Account Storage type.");
    if (this.userAccountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.getConfig().type;
  }

  public isUserAccountStorageAvailable(): boolean {
    this.logger.debug("Getting User Account Storage availability.");
    return this.userAccountStorage !== null;
  }

  public openUserAccountStorage(storageConfig: UserAccountStorageConfig): void {
    this.logger.debug(`Opening User Account Storage of type: ${storageConfig.type}.`);
    if (this.userAccountStorage !== null) {
      if (isDeepStrictEqual(this.userAccountStorage.getConfig(), storageConfig)) {
        this.logger.debug("This exact User Account Storage is already open. No-op.");
        return;
      }
      this.logger.debug(`User Account Storage (of type ${this.userAccountStorage.getConfig().type}) already open. Closing before opening new one.`);
      this.closeUserAccountStorage();
    }
    try {
      this.userAccountStorage = userAccountStorageFactory(storageConfig, this.userAccountStorageLogger, this.AJV);
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not open User Account Storage: ${ERROR_MESSAGE}!`);
      this.userAccountStorage = null;
      throw err;
    } finally {
      this.onUserAccountStorageAvailabilityChangeCallback(this.isUserAccountStorageAvailable());
    }
  }

  public closeUserAccountStorage(): boolean {
    this.logger.debug("Closing User Account Storage.");
    if (this.userAccountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    let isUserStorageClosed: boolean;
    try {
      isUserStorageClosed = this.userAccountStorage.close();
      if (isUserStorageClosed) {
        this.userAccountStorage = null;
      }
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not close User Account Storage: ${ERROR_MESSAGE}!`);
      this.userAccountStorage = null;
      isUserStorageClosed = false;
      throw err;
    } finally {
      this.onUserAccountStorageAvailabilityChangeCallback(this.isUserAccountStorageAvailable());
    }
    return isUserStorageClosed;
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Getting username availability for username: "${username}".`);
    if (this.userAccountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.isUsernameAvailable(username);
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
    if (this.userAccountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.getUserCount();
  }

  public signUpUser(userData: ISecuredNewUserData): boolean {
    this.logger.debug(`Signing up user: "${userData.username}".`);
    if (this.userAccountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.addUser(userData);
  }

  public signInUser(userSignInCredentials: IUserSignInCredentials): boolean {
    this.logger.debug(`Signing in "${userSignInCredentials.username}".`);
    if (this.userAccountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    const USER_ID: UUID | null = this.userAccountStorage.getUserIdByUsername(userSignInCredentials.username);
    if (USER_ID === null) {
      this.logger.debug("No user ID for given username. Username must be missing from storage. Sign in failed.");
      return false;
    }
    const USER_PASSWORD_DATA: [Buffer, Buffer] | null = this.userAccountStorage.getPasswordDataByUserId(USER_ID);
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
