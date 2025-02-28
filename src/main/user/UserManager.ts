import { LogFunctions } from "electron-log";
import { UserAccountStorageBackendType } from "./account/storage/backend/UserAccountStorageBackendType";
import { randomUUID, scryptSync, timingSafeEqual, UUID } from "node:crypto";
import { ISignedInUser, isSignedInUserValid } from "@main/user/account/SignedInUser";
import { SignedInUserChangedCallback, CurrentUserAccountStorageChangedCallback } from "@shared/IPC/APIs/UserAPI";
import { isDeepStrictEqual } from "node:util";
import Ajv, { ValidateFunction } from "ajv";
import { IUserDataStorageConfig } from "./data/storage/config/UserDataStorageConfig";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IUserSignInPayload, USER_SIGN_IN_PAYLOAD_JSON_SCHEMA } from "./account/UserSignInPayload";
import { IUserSignUpPayload, USER_SIGN_UP_PAYLOAD_JSON_SCHEMA } from "./account/UserSignUpPayload";
import { UserAccountStorage } from "./account/storage/UserAccountStorage";
import { IPublicUserAccountStorageConfig } from "@shared/user/account/storage/PublicUserAccountStorageConfig";
import { signedInUserToPublicSignedInUser } from "./account/utils/signedInUserToPublicSignedInUser";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IStorageSecuredUserDataStorageConfig } from "./data/storage/config/StorageSecuredUserDataStorageConfig";
import { userDataStorageConfigToSecuredUserDataStorageConfig } from "./data/storage/config/utils/userDataStorageConfigToSecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig } from "./data/storage/config/utils/securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig";
import { userSignUpPayloadToSecuredUserSignUpPayload } from "./account/utils/userSignUpPayloadToSecuredUserSignUpPayload";
import { ISecuredUserDataStorageConfig } from "./data/storage/config/SecuredUserDataStorageConfig";
import { storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig } from "./data/storage/config/utils/storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig";
import {
  IPrivateStorageSecuredUserDataStorageConfig,
  PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA
} from "./data/storage/config/PrivateStorageSecuredUserDataStorageConfig";

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
  public readonly PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION: ValidateFunction<IPrivateStorageSecuredUserDataStorageConfig>;
  private readonly PASSWORD_SALT_LENGTH = 32;

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
    this.PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION = this.AJV.compile<IPrivateStorageSecuredUserDataStorageConfig>(
      PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA
    );
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
            throw new Error(`Cannot set property "${String(property)}" on currently signed in user. Only "value" property can be set! No-op set`);
          }
          if (value !== null && !isSignedInUserValid(value)) {
            throw new Error(`Value must be null or a valid currently signed in user object! No-op set`);
          }
          const NEW_PUBLIC_SIGNED_IN_USER: IPublicSignedInUser | null = value === null ? null : signedInUserToPublicSignedInUser(value, this.logger);
          if (isDeepStrictEqual(target[property], value)) {
            this.logger.warn(`Currently signed in user already had this value: ${JSON.stringify(NEW_PUBLIC_SIGNED_IN_USER, null, 2)}. No-op set.`);
            return false;
          }
          // Corrupt data encryption key previous value was a signed in user
          if (target[property] !== null) {
            this.logger.info("Corrupting previous user data AES key buffer.");
            crypto.getRandomValues(target[property].userDataAESKey);
          } else {
            this.logger.info("No previous user data key buffer to corrupt.");
          }
          target[property] = value;
          if (value === null) {
            this.logger.info("Set currently signed in user to null (signed out).");
          } else {
            this.logger.info(`Set currently signed in user to: ${JSON.stringify(NEW_PUBLIC_SIGNED_IN_USER, null, 2)} (signed in).`);
          }
          this.onSignedInUserChangedCallback(NEW_PUBLIC_SIGNED_IN_USER);
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
            throw new Error(`Value must be null or an instance of User Account Storage! No-op set.`);
          }
          target[property] = value;
          if (value === null) {
            this.logger.info("Set User Account Storage to null (unavailable).");
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

  private deriveUserDataEncryptionAESKey(plainTextPassword: string, salt: Buffer): Buffer {
    this.logger.debug("Deriving user data encryption AES key.");
    return scryptSync(plainTextPassword, salt, 32);
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
    return this.userAccountStorage.value.addUser(
      userSignUpPayloadToSecuredUserSignUpPayload(
        userSignUpPayload,
        this.PASSWORD_SALT_LENGTH,
        (userPassword: string, userPasswordSalt: Buffer): string => {
          return this.hashPassword(userPassword, userPasswordSalt, "user sign up").toString("base64");
        },
        this.logger
      )
    );
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
    if (!timingSafeEqual(SIGN_IN_PASSWORD_HASH, Buffer.from(SECURED_USER_PASSWORD.hash, "base64"))) {
      this.logger.debug("Password hashes do not match.");
      return false;
    }
    this.logger.debug("Password hashes matched!");
    const DATA_ENCRYPTION_KEY_SALT: string | null = this.userAccountStorage.value.getUserDataEncryptionAESKeySalt(USER_ID);
    if (DATA_ENCRYPTION_KEY_SALT === null) {
      throw new Error(`No data encryption key salt for given user ID: "${USER_ID}"`);
    }
    this.signedInUser.value = {
      userId: USER_ID,
      username: userSignInPayload.username,
      userDataAESKey: this.deriveUserDataEncryptionAESKey(userSignInPayload.password, Buffer.from(DATA_ENCRYPTION_KEY_SALT, "base64"))
    };
    return true;
  }

  public signOutUser(): IPublicSignedInUser | null {
    this.logger.debug("Attempting sign out.");
    if (this.signedInUser.value === null) {
      this.logger.debug("No signed in user.");
      return null;
    }
    this.logger.debug(`Signing out user: "${this.signedInUser.value.username}".`);
    const PUBLIC_SIGNED_OUT_USER: IPublicSignedInUser = signedInUserToPublicSignedInUser(this.signedInUser.value, this.logger);
    this.signedInUser.value = null; // Encryption key gets corrupted in proxy
    return PUBLIC_SIGNED_OUT_USER;
  }

  public getPublicSignedInUser(): IPublicSignedInUser | null {
    if (this.signedInUser.value === null) {
      return null;
    }
    return signedInUserToPublicSignedInUser(this.signedInUser.value, this.logger);
  }

  public getCurrentUserAccountStorageConfig(): IPublicUserAccountStorageConfig | null {
    if (this.userAccountStorage.value === null) {
      return null;
    }
    return this.userAccountStorage.value.getPublicUserAccountStorageConfig();
  }

  public addUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): boolean {
    // TODO: Check that logged in user is the same as the config owner
    this.logger.debug(`Adding User Data Storage Config to user: "${userDataStorageConfig.userId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("Cannot encrypt Secured User Data Storage Config with no signed in user");
    }
    if (this.userAccountStorage.value.isUserIdAvailable(userDataStorageConfig.userId)) {
      throw new Error(`Cannot add User Data Storage to user "${userDataStorageConfig.userId}" because it does not exist`);
    }
    return this.userAccountStorage.value.addStorageSecuredUserDataStorageConfig(
      securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig(
        userDataStorageConfigToSecuredUserDataStorageConfig(
          userDataStorageConfig,
          this.PASSWORD_SALT_LENGTH,
          (visibilityPassword: string, visibilityPasswordSalt: Buffer): string => {
            return this.hashPassword(visibilityPassword, visibilityPasswordSalt, "user data storage visibility").toString("base64");
          },
          this.logger
        ),
        this.signedInUser.value.userDataAESKey,
        this.logger
      )
    );
  }

  public getAllSignedInUserSecuredUserDataStorageConfigs(): ISecuredUserDataStorageConfig[] {
    this.logger.debug("Getting all signed in user Secured User Data Storage Configs.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("Cannot decrypt Storage Secured User Data Storage Configs with no signed in user");
    }
    const STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS: IStorageSecuredUserDataStorageConfig[] =
      this.userAccountStorage.value.getAllStorageSecuredUserDataStorageConfigs(this.signedInUser.value.userId);
    const SECURED_USER_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = [];
    STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS.map((storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): void => {
      if (this.signedInUser.value === null) {
        throw new Error("Cannot decrypt Storage Secured User Data Storage Configs with no signed in user");
      }
      SECURED_USER_DATA_STORAGE_CONFIGS.push(
        storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig(
          storageSecuredUserDataStorageConfig,
          this.PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION,
          this.signedInUser.value.userDataAESKey,
          this.logger
        )
      );
    });
    return SECURED_USER_DATA_STORAGE_CONFIGS;
  }
}
