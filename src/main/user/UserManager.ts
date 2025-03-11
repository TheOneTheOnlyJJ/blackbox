import { LogFunctions } from "electron-log";
import { UserAccountStorageBackendType } from "./account/storage/backend/UserAccountStorageBackendType";
import { randomUUID, scryptSync, timingSafeEqual, UUID } from "node:crypto";
import { ISignedInUser, isSignedInUserValid } from "@main/user/account/SignedInUser";
import {
  SignedInUserChangedCallback,
  CurrentUserAccountStorageChangedCallback,
  UserAccountStorageOpenChangedCallback
} from "@shared/IPC/APIs/UserAPI";
import { isDeepStrictEqual } from "node:util";
import { IUserDataStorageConfig } from "./data/storage/config/UserDataStorageConfig";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IUserSignInPayload, USER_SIGN_IN_PAYLOAD_VALIDATE_FUNCTION } from "./account/UserSignInPayload";
import { IUserSignUpPayload, USER_SIGN_UP_PAYLOAD_VALIDATE_FUNCTION } from "./account/UserSignUpPayload";
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
import { IPublicUserDataStorageConfig } from "@shared/user/data/storage/config/public/PublicUserDataStorageConfig";
import { securedUserDataStorageConfigToPublicUserDataStorageConfig } from "./data/storage/config/utils/securedUserDataStorageConfigToPublicUserDataStorageConfig";
import { IPublicUserDataStoragesChangedDiff } from "@shared/user/data/storage/config/public/PublicUserDataStoragesChangedDiff";

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
  private onUserAccountStorageOpenChangedCallback: UserAccountStorageOpenChangedCallback;

  // User Data Storage
  private onUserDataStoragesChangedCallback: (publicUserDataStoragesChangedDiff: IPublicUserDataStoragesChangedDiff) => void;

  private readonly PASSWORD_SALT_LENGTH = 32;

  public constructor(
    logger: LogFunctions,
    onSignedInUserChangedCallback?: SignedInUserChangedCallback,
    onUserAccountStorageChangedCallback?: CurrentUserAccountStorageChangedCallback,
    onUserAccountStorageOpenChangedCallback?: UserAccountStorageOpenChangedCallback,
    onUserDataStoragesChangedCallback?: (publicUserDataStoragesChangedDiff: IPublicUserDataStoragesChangedDiff) => void
  ) {
    // Loggers
    this.logger = logger;
    this.logger.debug("Initialising new User Manager.");
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
    this.onUserAccountStorageOpenChangedCallback =
      onUserAccountStorageOpenChangedCallback ??
      ((): void => {
        this.logger.silly("No User Account Storage open status changed callback set.");
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

    // User Data Storage
    this.onUserDataStoragesChangedCallback =
      onUserDataStoragesChangedCallback ??
      ((): void => {
        this.logger.silly("No User Data Storages changed callback set.");
      });
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
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    const IS_OPEN: boolean = this.userAccountStorage.value.isOpen();
    this.logger.debug(`Getting User Account Storage open status: ${IS_OPEN.toString()}.`);
    return IS_OPEN;
  }

  public isUserAccountStorageSet(): boolean {
    const IS_AVAILABLE: boolean = this.userAccountStorage.value !== null;
    this.logger.debug(`Getting User Account Storage set status: ${IS_AVAILABLE.toString()}.`);
    return IS_AVAILABLE;
  }

  public setUserAccountStorage(accountStorage: UserAccountStorage): boolean {
    this.logger.debug(`Setting "${accountStorage.name}" User Account Storage (ID "${accountStorage.storageId}").`);
    if (this.userAccountStorage.value !== null) {
      if (this.userAccountStorage.value.storageId === accountStorage.storageId) {
        this.logger.warn("User Account Storage with same ID is already set. No-op.");
        return true;
      }
      this.logger.warn(`Already set "${this.userAccountStorage.value.name}" User Account Storage. Unsetting.`);
      this.unsetUserAccountStorage();
      if (this.isUserAccountStorageSet()) {
        this.logger.warn(`Could not unset previous "${this.userAccountStorage.value.name}" User Account Storage. No-op set.`);
        return false;
      }
    }
    this.userAccountStorage.value = accountStorage;
    return true;
  }

  public unsetUserAccountStorage(): boolean {
    this.logger.debug("Unsetting User Account Storage.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.isUserAccountStorageOpen() && !this.closeUserAccountStorage()) {
      this.logger.warn("No-op unset.");
      return false;
    }
    this.userAccountStorage.value = null;
    this.logger.debug("Unset User Account Storage.");
    return true;
  }

  public openUserAccountStorage(): boolean {
    this.logger.debug("Opening User Account Storage.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    const IS_OPEN: boolean = this.userAccountStorage.value.open();
    this.onUserAccountStorageOpenChangedCallback(IS_OPEN);
    return IS_OPEN;
  }

  public closeUserAccountStorage(): boolean {
    this.logger.debug("Closing User Account Storage.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    const IS_CLOSED: boolean = this.userAccountStorage.value.close();
    this.onUserAccountStorageOpenChangedCallback(!IS_CLOSED); // IS_OPEN
    return IS_CLOSED;
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
    if (!USER_SIGN_UP_PAYLOAD_VALIDATE_FUNCTION(userSignUpPayload)) {
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
    if (!USER_SIGN_IN_PAYLOAD_VALIDATE_FUNCTION(userSignInPayload)) {
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
    this.logger.debug(`Adding User Data Storage Config to user: "${userDataStorageConfig.userId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("Cannot encrypt Secured User Data Storage Config with no signed in user");
    }
    if (this.signedInUser.value.userId !== userDataStorageConfig.userId) {
      throw new Error(`Config user ID "${userDataStorageConfig.userId}" does not match signed in user ID "${this.signedInUser.value.userId}"`);
    }
    if (this.userAccountStorage.value.isUserIdAvailable(userDataStorageConfig.userId)) {
      throw new Error(`Cannot add User Data Storage to user "${userDataStorageConfig.userId}" because it does not exist`);
    }
    const NEW_SECURED_USER_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = userDataStorageConfigToSecuredUserDataStorageConfig(
      userDataStorageConfig,
      this.PASSWORD_SALT_LENGTH,
      (visibilityPassword: string, visibilityPasswordSalt: Buffer): string => {
        return this.hashPassword(visibilityPassword, visibilityPasswordSalt, "user data storage visibility").toString("base64");
      },
      this.logger
    );
    const IS_ADDED_SUCCESSFULLY: boolean = this.userAccountStorage.value.addStorageSecuredUserDataStorageConfig(
      securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig(
        NEW_SECURED_USER_DATA_STORAGE_CONFIG,
        this.signedInUser.value.userDataAESKey,
        this.logger
      )
    );
    if (IS_ADDED_SUCCESSFULLY) {
      this.onUserDataStoragesChangedCallback({
        deleted: [],
        added: [securedUserDataStorageConfigToPublicUserDataStorageConfig(NEW_SECURED_USER_DATA_STORAGE_CONFIG, this.logger)]
      } satisfies IPublicUserDataStoragesChangedDiff);
    }
    return IS_ADDED_SUCCESSFULLY;
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
          this.signedInUser.value.userDataAESKey,
          null
        )
      );
    });
    return SECURED_USER_DATA_STORAGE_CONFIGS;
  }

  public getAllSignedInUserPublicUserDataStorageConfigs(): IPublicUserDataStorageConfig[] {
    this.logger.debug("Getting all signed in user Public User Data Storage Configs.");
    const ALL_SECURED_USER_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = this.getAllSignedInUserSecuredUserDataStorageConfigs();
    const ALL_PUBLIC_USER_DATA_STORAGE_CONFIGS: IPublicUserDataStorageConfig[] = [];
    ALL_SECURED_USER_DATA_STORAGE_CONFIGS.map((securedUserDataStorageConfig: ISecuredUserDataStorageConfig): void => {
      ALL_PUBLIC_USER_DATA_STORAGE_CONFIGS.push(securedUserDataStorageConfigToPublicUserDataStorageConfig(securedUserDataStorageConfig, null));
    });
    return ALL_PUBLIC_USER_DATA_STORAGE_CONFIGS;
  }
}
