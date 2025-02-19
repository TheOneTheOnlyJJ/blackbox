import { LogFunctions } from "electron-log";
import { UserAccountStorageBackend } from "./account/storage/backend/UserAccountStorageBackend";
import { userAccountStorageBackendFactory } from "./account/storage/backend/userAccountStorageBackendFactory";
import { UserAccountStorageBackendType } from "./account/storage/backend/UserAccountStorageBackendType";
import { USER_SIGN_UP_DATA_JSON_SCHEMA, IUserSignUpData } from "@shared/user/account/UserSignUpData";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, UUID } from "node:crypto";
import { ISecuredUserSignUpData } from "./account/SecuredUserSignUpData";
import { CURRENTLY_SIGNED_IN_USER_JSON_SCHEMA, ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { CurrentlySignedInUserChangedCallback, UserAccountStorageBackendAvailabilityChangedCallback } from "@shared/IPC/APIs/UserAPI";
import { isDeepStrictEqual } from "node:util";
import Ajv, { ValidateFunction } from "ajv";
import { UserAccountStorageBackendConfig } from "./account/storage/backend/UserAccountStorageBackendConfig";
import { IUserDataStorageConfig } from "./data/storage/UserDataStorageConfig";
import { IUserSignInData, USER_SIGN_IN_DATA_JSON_SCHEMA } from "@shared/user/account/UserSignInData";
import { ISecuredUserDataStorageConfig } from "./data/storage/SecuredUserDataStorageConfig";
import { ISecuredPasswordData } from "@main/utils/encryption/SecuredPasswordData";

export class UserManager {
  private readonly logger: LogFunctions;
  private readonly userAccountStorageBackendLogger: LogFunctions;

  // Currently signed in user
  // Must be wrapped in an object because it is a proxy
  private currentlySignedInUser: { value: ICurrentlySignedInUser | null };
  public onCurrentlySignedInUserChangedCallback: CurrentlySignedInUserChangedCallback;

  // User Account Storage Backend
  // Must be wrapped in an object because it too is a proxy
  private userAccountStorageBackend: { value: UserAccountStorageBackend<UserAccountStorageBackendConfig> | null };
  // This is needed to let the renderer know if the User Account Storage Backend is available when it changes
  public onUserAccountStorageBackendAvailabilityChangedCallback: UserAccountStorageBackendAvailabilityChangedCallback;

  // AJV insatnce
  private readonly AJV: Ajv;
  // AJV Validate functions
  public readonly USER_SIGN_UP_DATA_VALIDATE_FUNCTION: ValidateFunction<IUserSignUpData>;
  public readonly USER_SIGN_IN_DATA_VALIDATE_FUNCTION: ValidateFunction<IUserSignInData>;
  public readonly CURRENTLY_SIGNED_IN_USER_VALIDATE_FUNCTION: ValidateFunction<ICurrentlySignedInUser>;

  public constructor(logger: LogFunctions, userAccountStorageBackendLogger: LogFunctions, ajv: Ajv) {
    // Loggers
    this.logger = logger;
    this.logger.debug("Initialising new User Manager.");
    this.userAccountStorageBackendLogger = userAccountStorageBackendLogger;
    // AJV and validators
    this.AJV = ajv;
    this.USER_SIGN_UP_DATA_VALIDATE_FUNCTION = this.AJV.compile<IUserSignUpData>(USER_SIGN_UP_DATA_JSON_SCHEMA);
    this.USER_SIGN_IN_DATA_VALIDATE_FUNCTION = this.AJV.compile<IUserSignInData>(USER_SIGN_IN_DATA_JSON_SCHEMA);
    this.CURRENTLY_SIGNED_IN_USER_VALIDATE_FUNCTION = this.AJV.compile<ICurrentlySignedInUser>(CURRENTLY_SIGNED_IN_USER_JSON_SCHEMA);
    // Currently signed in user
    this.onCurrentlySignedInUserChangedCallback = (): void => {
      this.logger.silly("No currently signed in user changed callback set.");
    };
    // Currently signed in user proxy that performs validation and calls the change callback when required
    this.currentlySignedInUser = new Proxy<{ value: ICurrentlySignedInUser | null }>(
      { value: null },
      {
        set: (target: { value: ICurrentlySignedInUser | null }, property: string | symbol, value: unknown): boolean => {
          if (property !== "value") {
            throw new Error(`Cannot set property "${String(property)}" on currently signed in user. Only "value" property can be set! No-op set.`);
          }
          if (value !== null && !this.CURRENTLY_SIGNED_IN_USER_VALIDATE_FUNCTION(value)) {
            throw new Error(`Value must be "null" or a valid currently signed in user object! No-op set.`);
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
          this.onCurrentlySignedInUserChangedCallback(value);
          return true;
        }
      }
    );
    // User Account Storage
    this.onUserAccountStorageBackendAvailabilityChangedCallback = (): void => {
      this.logger.silly("No User Account Storage Backend availability changed callback set.");
    };
    // User Account Storage proxy that performs validation and calls the change callback when required
    this.userAccountStorageBackend = new Proxy<{ value: UserAccountStorageBackend<UserAccountStorageBackendConfig> | null }>(
      { value: null },
      {
        set: (
          target: { value: UserAccountStorageBackend<UserAccountStorageBackendConfig> | null },
          property: string | symbol,
          value: unknown
        ): boolean => {
          if (property !== "value") {
            throw new Error(
              `Cannot set property "${String(property)}" on User Account Storage Backend. Only "value" property can be set! No-op set.`
            );
          }
          if (value !== null && !(value instanceof UserAccountStorageBackend)) {
            throw new Error(`Value must be "null" or an instance of User Account Storage Backend! No-op set.`);
          }
          target[property] = value;
          if (value === null) {
            this.logger.info('User Account Storage Backend set to "null" (unavailable).');
            this.onUserAccountStorageBackendAvailabilityChangedCallback(false);
          } else {
            this.logger.info(`User Account Storage Backend set with config: ${JSON.stringify(value.config, null, 2)} (available).`);
            this.onUserAccountStorageBackendAvailabilityChangedCallback(true);
          }
          return true;
        }
      }
    );
  }

  public getUserAccountStorageBackendType(): UserAccountStorageBackendType {
    this.logger.debug("Getting User Account Storage Backend type.");
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    return this.userAccountStorageBackend.value.config.type;
  }

  public isUserAccountStorageBackendAvailable(): boolean {
    this.logger.debug("Getting User Account Storage Backend availability.");
    return this.userAccountStorageBackend.value !== null;
  }

  public openUserAccountStorageBackend(config: UserAccountStorageBackendConfig): boolean {
    this.logger.debug(`Opening User Account Storage Backend.`);
    if (this.userAccountStorageBackend.value !== null) {
      if (isDeepStrictEqual(this.userAccountStorageBackend.value.config, config)) {
        this.logger.debug("This exact User Account Storage Backend is already open. No-op.");
        return false;
      }
      this.logger.debug(
        `Previous "${this.userAccountStorageBackend.value.config.type}" User Account Storage Backend still open. Closing before opening new one.`
      );
      const IS_PREVIOUS_USER_ACCOUNT_STORAGE_BACKEND_CLOSED: boolean = this.closeUserAccountStorageBackend();
      if (!IS_PREVIOUS_USER_ACCOUNT_STORAGE_BACKEND_CLOSED) {
        this.logger.warn(`Could not close previous "${this.userAccountStorageBackend.value.config.type}" User Account Storage Backend. No-op.`);
        return false;
      }
    }
    try {
      this.userAccountStorageBackend.value = userAccountStorageBackendFactory(config, this.userAccountStorageBackendLogger, this.AJV);
      this.logger.debug(`Opened "${this.userAccountStorageBackend.value.config.type}" User Account Storage Backend.`);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not open "${config.type}" User Account Storage Backend: ${ERROR_MESSAGE}!`);
      this.userAccountStorageBackend.value = null;
      return false;
    }
  }

  public closeUserAccountStorageBackend(): boolean {
    this.logger.debug("Closing User Account Storage Backend.");
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    let isUserAccountStorageBackendClosed: boolean;
    try {
      isUserAccountStorageBackendClosed = this.userAccountStorageBackend.value.close();
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not close "${this.userAccountStorageBackend.value.config.type}" User Account Storage Backend: ${ERROR_MESSAGE}!`);
      return false;
    }
    if (isUserAccountStorageBackendClosed) {
      this.logger.debug(`Closed "${this.userAccountStorageBackend.value.config.type}" User Account Storage Backend.`);
      this.userAccountStorageBackend.value = null;
    } else {
      this.logger.warn(`Could not close "${this.userAccountStorageBackend.value.config.type}" User Account Storage Backend.`);
    }
    return isUserAccountStorageBackendClosed;
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Getting username availability for username: "${username}".`);
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    return this.userAccountStorageBackend.value.isUsernameAvailable(username);
  }

  private hashPassword(plainTextPassword: string, salt: Buffer, passwordPurposeToLog?: string): Buffer {
    this.logger.debug(`Hashing ${passwordPurposeToLog ? passwordPurposeToLog + " " : ""}password.`);
    // TODO: Change scrypt to argon2 once it becomes available
    return scryptSync(plainTextPassword, salt, 64);
  }

  public generateRandomUserId(): UUID {
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    let userId: UUID = randomUUID({ disableEntropyCache: true });
    this.logger.debug(`Checking user ID "${userId}" availability.`);
    while (!this.userAccountStorageBackend.value.isUserIdAvailable(userId)) {
      this.logger.debug(`User ID "${userId}" not available. Generating a new random one.`);
      userId = randomUUID({ disableEntropyCache: true });
    }
    this.logger.debug(`User ID "${userId}" available.`);
    return userId;
  }

  // TODO: Move this out of here
  public secureUserSignUpData(userId: UUID, userSignUpData: IUserSignUpData): ISecuredUserSignUpData {
    this.logger.debug(`Securing user sign up data for user: "${userSignUpData.username}".`);
    const PASSWORD_SALT: Buffer = randomBytes(16);
    const SECURED_USER_DATA: ISecuredUserSignUpData = {
      userId: userId,
      username: userSignUpData.username,
      securedPassword: {
        hash: this.hashPassword(userSignUpData.password, PASSWORD_SALT, "user sign up").toString("base64"),
        salt: PASSWORD_SALT.toString("base64")
      }
    };
    return SECURED_USER_DATA;
  }

  public generateRandomUserDataStorageConfigId(): UUID {
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    let configId: UUID = randomUUID({ disableEntropyCache: true });
    this.logger.debug(`Checking User Data Storage Config ID "${configId}" availability.`);
    while (!this.userAccountStorageBackend.value.isUserDataStorageConfigIdAvailable(configId)) {
      this.logger.debug(`User Data Storage Config ID "${configId}" not available. Generating a new random one.`);
      configId = randomUUID({ disableEntropyCache: true });
    }
    this.logger.debug(`User Data Storage Config ID "${configId}" available.`);
    return configId;
  }

  // TODO: Move this out of here
  public secureUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): ISecuredUserDataStorageConfig {
    this.logger.debug(`Securing User Data Storage Config with ID: "${userDataStorageConfig.configId}".`);
    let securedVisibilityPassword: ISecuredPasswordData | undefined;
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
    return {
      configId: userDataStorageConfig.configId,
      name: userDataStorageConfig.name,
      securedVisibilityPassword: securedVisibilityPassword,
      backendConfig: userDataStorageConfig.backendConfig
    };
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    return this.userAccountStorageBackend.value.getUserCount();
  }

  public signUpUser(userSignUpData: IUserSignUpData): boolean {
    this.logger.debug(`Signing up user: "${userSignUpData.username}".`);
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    const USER_ID: UUID = this.generateRandomUserId();
    const SECURED_USER_SIGN_UP_DATA: ISecuredUserSignUpData = this.secureUserSignUpData(USER_ID, userSignUpData);
    this.logger.debug("Secured user sign up data.");
    return this.userAccountStorageBackend.value.addUser(SECURED_USER_SIGN_UP_DATA);
  }

  public signInUser(userSignInData: IUserSignInData): boolean {
    this.logger.debug(`Attempting sign in for user: "${userSignInData.username}".`);
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    const USER_ID: UUID | null = this.userAccountStorageBackend.value.getUserId(userSignInData.username);
    if (USER_ID === null) {
      this.logger.debug("No user ID for given username. Username must be missing from storage. Sign in failed.");
      return false;
    }
    const SECURED_USER_PASSWORD_DATA: ISecuredPasswordData | null = this.userAccountStorageBackend.value.getSecuredUserPasswordData(USER_ID);
    if (SECURED_USER_PASSWORD_DATA === null) {
      throw new Error(`No password hash and salt for user: "${USER_ID}"`);
    }
    const SIGN_IN_PASSWORD_HASH: Buffer = this.hashPassword(
      userSignInData.password,
      Buffer.from(SECURED_USER_PASSWORD_DATA.salt, "base64"),
      "user sign in"
    );
    if (timingSafeEqual(SIGN_IN_PASSWORD_HASH, Buffer.from(SECURED_USER_PASSWORD_DATA.hash, "base64"))) {
      this.logger.debug("Password hashes matched! Signing in.");
      this.currentlySignedInUser.value = { userId: USER_ID, username: userSignInData.username };
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

  public addUserDataStorageConfigToUser(userDataStorageConfig: IUserDataStorageConfig): boolean {
    this.logger.debug(`Adding User Data Storage Config to user: "${userDataStorageConfig.userId}".`);
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    // TODO: Encrypt the config with a KDF derived from the user's password
    if (this.userAccountStorageBackend.value.isUserIdAvailable(userDataStorageConfig.userId)) {
      throw new Error(`Cannot add User Data Storage to user "${userDataStorageConfig.userId}" because it does not exist`);
    }
    const SECURED_USER_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = this.secureUserDataStorageConfig(userDataStorageConfig);
    this.logger.debug("Secured User Data Storage Config.");
    return this.userAccountStorageBackend.value.addUserDataStorageConfigToUser(userDataStorageConfig.userId, SECURED_USER_DATA_STORAGE_CONFIG);
  }

  public getAllUserDataStorageConfigs(userId: UUID): ISecuredUserDataStorageConfig[] {
    this.logger.debug(`Getting all User Data Storage Configs owned by user: "${userId}".`);
    if (this.userAccountStorageBackend.value === null) {
      throw new Error("Null User Account Storage Backend");
    }
    return this.userAccountStorageBackend.value.getAllUserDataStorageConfigs(userId);
  }
}
