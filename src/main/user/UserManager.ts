import { LogFunctions } from "electron-log";
import { UserAccountStorageBackendType } from "./account/storage/backend/UserAccountStorageBackendType";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, UUID } from "node:crypto";
import { ISecuredUserSignUpPayload } from "./account/SecuredUserSignUpPayload";
import { SIGNED_IN_USER_JSON_SCHEMA, ISignedInUser } from "@shared/user/account/SignedInUser";
import { SignedInUserChangedCallback, CurrentUserAccountStorageChangedCallback } from "@shared/IPC/APIs/UserAPI";
import { isDeepStrictEqual } from "node:util";
import Ajv, { ValidateFunction } from "ajv";
import { IUserDataStorageConfig } from "./data/storage/config/UserDataStorageConfig";
import { ISecuredUserDataStorageConfig } from "./data/storage/config/SecuredUserDataStorageConfig";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IUserSignInPayload, USER_SIGN_IN_PAYLOAD_JSON_SCHEMA } from "./account/UserSignInPayload";
import { IUserSignUpPayload, USER_SIGN_UP_PAYLOAD_JSON_SCHEMA } from "./account/UserSignUpPayload";
import { UserAccountStorage } from "./account/storage/UserAccountStorage";
import { ICurrentUserAccountStorage } from "@shared/user/account/storage/CurrentUserAccountStorage";

export class UserManager {
  private readonly logger: LogFunctions;

  // Currently signed in user
  // Must be wrapped in an object because it is a proxy
  private signedInUser: { value: ISignedInUser | null };
  public onSignedInUserChangedCallback: SignedInUserChangedCallback;

  // User Account Storage
  // Must be wrapped in an object because it too is a proxy
  private userAccountStorage: { value: UserAccountStorage | null };
  public onUserAccountStorageChangedCallback: CurrentUserAccountStorageChangedCallback;

  // AJV insatnce
  private readonly AJV: Ajv;
  // AJV Validate functions
  public readonly USER_SIGN_UP_PAYLOAD_VALIDATE_FUNCTION: ValidateFunction<IUserSignUpPayload>;
  public readonly USER_SIGN_IN_PAYLOAD_VALIDATE_FUNCTION: ValidateFunction<IUserSignInPayload>;
  public readonly CURRENTLY_SIGNED_IN_USER_VALIDATE_FUNCTION: ValidateFunction<ISignedInUser>;

  public constructor(
    logger: LogFunctions,
    ajv: Ajv,
    onSignedInUserChangedCallback?: SignedInUserChangedCallback,
    onUserAccountStorageChangedCallback?: CurrentUserAccountStorageChangedCallback
  ) {
    // Loggers
    this.logger = logger;
    this.logger.debug("Initialising new User Manager.");
    // AJV and validators
    this.AJV = ajv;
    this.USER_SIGN_UP_PAYLOAD_VALIDATE_FUNCTION = this.AJV.compile<IUserSignUpPayload>(USER_SIGN_UP_PAYLOAD_JSON_SCHEMA);
    this.USER_SIGN_IN_PAYLOAD_VALIDATE_FUNCTION = this.AJV.compile<IUserSignInPayload>(USER_SIGN_IN_PAYLOAD_JSON_SCHEMA);
    this.CURRENTLY_SIGNED_IN_USER_VALIDATE_FUNCTION = this.AJV.compile<ISignedInUser>(SIGNED_IN_USER_JSON_SCHEMA);
    // Currently signed in user
    this.onSignedInUserChangedCallback =
      onSignedInUserChangedCallback ??
      ((): void => {
        this.logger.silly("No currently signed in user changed callback set.");
      });
    // Currently signed in user proxy that performs validation and calls the change callback when required
    this.signedInUser = new Proxy<{ value: ISignedInUser | null }>(
      { value: null },
      {
        set: (target: { value: ISignedInUser | null }, property: string | symbol, value: unknown): boolean => {
          if (property !== "value") {
            throw new Error(`Cannot set property "${String(property)}" on currently signed in user. Only "value" property can be set! No-op set.`);
          }
          if (value !== null && !this.CURRENTLY_SIGNED_IN_USER_VALIDATE_FUNCTION(value)) {
            throw new Error(`Value must be "null" or a valid currently signed in user object! No-op set.`);
          }
          if (isDeepStrictEqual(target[property], value)) {
            this.logger.warn(`Currently signed in user already had this value: ${JSON.stringify(value, null, 2)}. No-op set.`);
            return false;
          }
          target[property] = value;
          if (value === null) {
            this.logger.info('Set currently signed in user to "null" (signed out).');
          } else {
            this.logger.info(`Set currently signed in user to: ${JSON.stringify(value, null, 2)} (signed in).`);
          }
          this.onSignedInUserChangedCallback(value);
          return true;
        }
      }
    );
    // User Account Storage
    this.onUserAccountStorageChangedCallback =
      onUserAccountStorageChangedCallback ??
      ((): void => {
        this.logger.silly("No User Account Storage changed callback set.");
      });
    // User Account Storage proxy that performs validation and calls the change callback when required
    this.userAccountStorage = new Proxy<{ value: UserAccountStorage | null }>(
      { value: null },
      {
        set: (target: { value: UserAccountStorage | null }, property: string | symbol, value: unknown): boolean => {
          if (property !== "value") {
            throw new Error(`Cannot set property "${String(property)}" on User Account Storage. Only "value" property can be set! No-op set.`);
          }
          if (value !== null && !(value instanceof UserAccountStorage)) {
            throw new Error(`Value must be "null" or an instance of User Account Storage! No-op set.`);
          }
          target[property] = value;
          if (value === null) {
            this.logger.info('Set User Account Storage to "null" (unavailable).');
            this.onUserAccountStorageChangedCallback(null);
          } else {
            this.logger.info(`Set "${value.name}" User Account Storage (ID "${value.storageId}") (available).`);
            this.onUserAccountStorageChangedCallback({ storageId: value.storageId, name: value.name, isOpen: value.isOpen() });
          }
          return true;
        }
      }
    );
  }

  public getUserAccountStorageBackendType(): UserAccountStorageBackendType {
    this.logger.debug("Getting User Account Storage Backend type.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    const BACKEND_TYPE: UserAccountStorageBackendType = this.userAccountStorage.value.getBackendType();
    this.logger.debug(`User Account Storage Backend type: "${BACKEND_TYPE}".`);
    return BACKEND_TYPE;
  }

  public isUserAccountStorageOpen(): boolean {
    const IS_OPEN = Boolean(this.userAccountStorage.value?.isOpen());
    this.logger.debug(`Getting User Account Storage open status: ${IS_OPEN.toString()}.`);
    return IS_OPEN;
  }

  public isUserAccountStorageSet(): boolean {
    const IS_AVAILABLE: boolean = this.userAccountStorage.value !== null;
    this.logger.debug(`Getting User Account Storage set status: ${IS_AVAILABLE.toString()}.`);
    return IS_AVAILABLE;
  }

  public setUserAccountStorage(accountStorage: UserAccountStorage): void {
    this.logger.debug(`Setting "${accountStorage.name}" User Account Storage (ID "${accountStorage.storageId}").`);
    if (this.userAccountStorage.value !== null) {
      if (this.userAccountStorage.value.storageId === accountStorage.storageId) {
        this.logger.warn("User Account Storage with same ID is already set. No-op.");
        return;
      }
      this.logger.warn(`Already set "${this.userAccountStorage.value.name}" User Account Storage. Unsetting.`);
      this.unsetUserAccountStorage();
      if (this.isUserAccountStorageSet()) {
        this.logger.warn(`Could not unset previous "${this.userAccountStorage.value.name}" User Account Storage. No-op set.`);
        return;
      }
    }
    this.userAccountStorage.value = accountStorage;
  }

  public unsetUserAccountStorage(): void {
    this.logger.debug("Unsetting User Account Storage.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.isUserAccountStorageOpen()) {
      this.closeUserAccountStorage();
    }
    if (this.isUserAccountStorageOpen()) {
      this.logger.warn("No-op unset.");
    } else {
      this.userAccountStorage.value = null;
      this.logger.debug("Unset User Account Storage.");
    }
  }

  public openUserAccountStorage(): void {
    this.logger.debug("Opening User Account Storage.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    try {
      this.userAccountStorage.value.open();
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not open "${this.userAccountStorage.value.name}" User Account Storage: ${ERROR_MESSAGE}!`);
    }
  }

  public closeUserAccountStorage(): void {
    this.logger.debug("Closing User Account Storage.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    try {
      this.userAccountStorage.value.close();
      this.logger.debug(`Closed "${this.userAccountStorage.value.name}" User Account Storage.`);
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not close "${this.userAccountStorage.value.name}" User Account Storage: ${ERROR_MESSAGE}!`);
    }
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Getting username availability for username: "${username}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.isUsernameAvailable(username);
  }

  private hashPassword(plainTextPassword: string, salt: Buffer, passwordPurposeToLog?: string): Buffer {
    this.logger.debug(`Hashing ${passwordPurposeToLog ? passwordPurposeToLog + " " : ""}password.`);
    // TODO: Change scrypt to argon2 once it becomes available
    return scryptSync(plainTextPassword, salt, 64);
  }

  public generateRandomUserId(): UUID {
    this.logger.debug("Generating random User ID.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    let userId: UUID = randomUUID({ disableEntropyCache: true });
    this.logger.debug(`Checking user ID "${userId}" availability.`);
    while (!this.userAccountStorage.value.isUserIdAvailable(userId)) {
      this.logger.debug(`User ID "${userId}" not available. Generating a new random one.`);
      userId = randomUUID({ disableEntropyCache: true });
    }
    this.logger.debug(`Generated random User ID "${userId}".`);
    return userId;
  }

  // TODO: Move this out of here; Maybe not for consistency with the other one?
  public secureUserSignUpPayload(userSignUpPayload: IUserSignUpPayload): ISecuredUserSignUpPayload {
    this.logger.debug(`Securing user sign up payload for user: "${userSignUpPayload.username}".`);
    const PASSWORD_SALT: Buffer = randomBytes(16);
    const SECURED_USER_SIGN_UP_PAYLOAD: ISecuredUserSignUpPayload = {
      userId: userSignUpPayload.userId,
      username: userSignUpPayload.username,
      securedPassword: {
        hash: this.hashPassword(userSignUpPayload.password, PASSWORD_SALT, "user sign up").toString("base64"),
        salt: PASSWORD_SALT.toString("base64")
      }
    };
    return SECURED_USER_SIGN_UP_PAYLOAD;
  }

  public generateRandomUserDataStorageId(): UUID {
    this.logger.debug("Generating random User Data Storage ID.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    let storageId: UUID = randomUUID({ disableEntropyCache: true });
    this.logger.debug(`Checking User Data Storage ID "${storageId}" availability.`);
    while (!this.userAccountStorage.value.isUserDataStorageIdAvailable(storageId)) {
      this.logger.debug(`User Data Storage ID "${storageId}" not available. Generating a new random one.`);
      storageId = randomUUID({ disableEntropyCache: true });
    }
    this.logger.debug(`Generated random User Data Storage ID "${storageId}".`);
    return storageId;
  }

  // TODO: Move this out of here? NO, this will become the function that encrypts for storage
  public secureUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): ISecuredUserDataStorageConfig {
    this.logger.debug(`Securing User Data Storage Config with ID: "${userDataStorageConfig.storageId}".`);
    let securedVisibilityPassword: ISecuredPassword | undefined;
    if (userDataStorageConfig.visibilityPassword !== undefined) {
      this.logger.debug("Config has a visibility password.");
      const VISIBILITY_PASSWORD_SALT: Buffer = randomBytes(16);
      securedVisibilityPassword = {
        hash: this.hashPassword(userDataStorageConfig.visibilityPassword, VISIBILITY_PASSWORD_SALT, "user data storage visibility").toString(
          "base64"
        ),
        salt: VISIBILITY_PASSWORD_SALT.toString("base64")
      };
    } else {
      this.logger.debug("Config does not have a visibility password.");
      securedVisibilityPassword = undefined;
    }
    const SECURED_USER_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = {
      storageId: userDataStorageConfig.storageId,
      name: userDataStorageConfig.name,
      description: userDataStorageConfig.description,
      securedVisibilityPassword: securedVisibilityPassword,
      backendConfig: userDataStorageConfig.backendConfig
    };
    return SECURED_USER_DATA_STORAGE_CONFIG;
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.getUserCount();
  }

  public signUpUser(userSignUpPayload: IUserSignUpPayload): boolean {
    this.logger.debug(`Signing up user: "${userSignUpPayload.username}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (!this.USER_SIGN_UP_PAYLOAD_VALIDATE_FUNCTION(userSignUpPayload)) {
      throw new Error("Invalid user sign up payload");
    }
    return this.userAccountStorage.value.addUser(this.secureUserSignUpPayload(userSignUpPayload));
  }

  public signInUser(userSignInPayload: IUserSignInPayload): boolean {
    this.logger.debug(`Attempting sign in for user: "${userSignInPayload.username}".`);
    if (this.signedInUser.value !== null) {
      this.logger.warn(`A user is already signed is: ${JSON.stringify(this.signedInUser.value, null, 2)}.`);
    }
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (!this.USER_SIGN_IN_PAYLOAD_VALIDATE_FUNCTION(userSignInPayload)) {
      throw new Error("Invalid user sign in payload");
    }
    const USER_ID: UUID | null = this.userAccountStorage.value.getUserId(userSignInPayload.username);
    if (USER_ID === null) {
      this.logger.debug("No user ID for given username.");
      return false;
    }
    const SECURED_USER_PASSWORD: ISecuredPassword | null = this.userAccountStorage.value.getSecuredUserPassword(USER_ID);
    if (SECURED_USER_PASSWORD === null) {
      throw new Error(`No password hash and salt for user: "${USER_ID}"`);
    }
    const SIGN_IN_PASSWORD_HASH: Buffer = this.hashPassword(
      userSignInPayload.password,
      Buffer.from(SECURED_USER_PASSWORD.salt, "base64"),
      "user sign in"
    );
    if (timingSafeEqual(SIGN_IN_PASSWORD_HASH, Buffer.from(SECURED_USER_PASSWORD.hash, "base64"))) {
      this.logger.debug("Password hashes matched!");
      this.signedInUser.value = { userId: USER_ID, username: userSignInPayload.username };
      return true;
    }
    this.logger.debug("Password hashes do not match.");
    return false;
  }

  public signOutUser(): ISignedInUser | null {
    this.logger.debug("Attempting sign out.");
    if (this.signedInUser.value === null) {
      this.logger.debug("No signed in user.");
      return null;
    }
    this.logger.debug(`Signing out user: "${this.signedInUser.value.username}".`);
    const SIGNED_OUT_USER: ISignedInUser = this.signedInUser.value;
    this.signedInUser.value = null;
    return SIGNED_OUT_USER;
  }

  public getSignedInUser(): ISignedInUser | null {
    return this.signedInUser.value;
  }

  // TODO: Move this maybe? Or do something about it being more related to the front end? It is in userManager though, so maybe should be here?
  public getCurrentUserAccountStorage(): ICurrentUserAccountStorage | null {
    if (this.userAccountStorage.value === null) {
      return null;
    }
    return {
      storageId: this.userAccountStorage.value.storageId,
      name: this.userAccountStorage.value.name,
      isOpen: this.userAccountStorage.value.isOpen()
    };
  }

  public addUserDataStorageConfigToUser(userDataStorageConfig: IUserDataStorageConfig): boolean {
    this.logger.debug(`Adding User Data Storage Config to user: "${userDataStorageConfig.userId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    // TODO: Encrypt the config with a KDF derived from the user's password
    if (this.userAccountStorage.value.isUserIdAvailable(userDataStorageConfig.userId)) {
      throw new Error(`Cannot add User Data Storage to user "${userDataStorageConfig.userId}" because it does not exist`);
    }
    const SECURED_USER_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = this.secureUserDataStorageConfig(userDataStorageConfig);
    return this.userAccountStorage.value.addUserDataStorageConfigToUser(userDataStorageConfig.userId, SECURED_USER_DATA_STORAGE_CONFIG);
  }

  public getAllUserDataStorageConfigs(userId: UUID): ISecuredUserDataStorageConfig[] {
    this.logger.debug(`Getting all User Data Storage Configs owned by user: "${userId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.getAllUserDataStorageConfigs(userId);
  }
}
