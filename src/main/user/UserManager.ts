import { LogFunctions } from "electron-log";
import { UserAccountStorageBackendType } from "./account/storage/backend/UserAccountStorageBackendType";
import { randomUUID, scryptSync, timingSafeEqual, UUID } from "node:crypto";
import { ISignedInUser, isSignedInUserValid } from "@main/user/account/SignedInUser";
import { SignedInUserChangedCallback, UserAccountStorageChangedCallback, UserAccountStorageOpenChangedCallback } from "@shared/IPC/APIs/UserAPI";
import { isDeepStrictEqual } from "node:util";
import { IUserDataStorageConfig } from "./data/storage/config/UserDataStorageConfig";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IUserSignInPayload, USER_SIGN_IN_PAYLOAD_VALIDATE_FUNCTION } from "./account/UserSignInPayload";
import { IUserSignUpPayload, USER_SIGN_UP_PAYLOAD_VALIDATE_FUNCTION } from "./account/UserSignUpPayload";
import { UserAccountStorage } from "./account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { signedInUserToPublicSignedInUser } from "./account/utils/signedInUserToPublicSignedInUser";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IStorageSecuredUserDataStorageConfig } from "./data/storage/config/StorageSecuredUserDataStorageConfig";
import { userDataStorageConfigToSecuredUserDataStorageConfig } from "./data/storage/config/utils/userDataStorageConfigToSecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig } from "./data/storage/config/utils/securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig";
import { userSignUpPayloadToSecuredUserSignUpPayload } from "./account/utils/userSignUpPayloadToSecuredUserSignUpPayload";
import { ISecuredUserDataStorageConfig } from "./data/storage/config/SecuredUserDataStorageConfig";
import { storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig } from "./data/storage/config/utils/storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { securedUserDataStorageConfigToUserDataStorageInfo } from "./data/storage/config/utils/securedUserDataStorageConfigToUserDataStorageInfo";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { IUserDataStorageVisibilityGroup } from "./data/storage/visibilityGroup/UserDataStorageVisibilityGroup";
import { ISecuredUserDataStorageVisibilityGroup } from "./data/storage/visibilityGroup/SecuredUserDataStorageVisibilityGroup";
import { userDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup } from "./data/storage/visibilityGroup/utils/userDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup";
import { securedUserDataStorageVisibilityGroupToStorageSecuredUserDataStorageVisibilityGroup } from "./data/storage/visibilityGroup/utils/securedUserDataStorageVisibilityGroupToStorageSecuredUserDataStorageVisibilityGroup";
import { IUserDataStorageVisibilityGroupsOpenRequest } from "./data/storage/visibilityGroup/openRequest/UserDataStorageVisibilityGroupsOpenRequest";
import { IStorageSecuredUserDataStorageVisibilityGroup } from "./data/storage/visibilityGroup/StorageSecuredUserDataStorageVisibilityGroup";
import { storageSecuredUserDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup } from "./data/storage/visibilityGroup/utils/storageSecuredUserDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup";
import { IUserDataStorageVisibilityGroupsInfoChangedDiff } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { securedUserDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo } from "./data/storage/visibilityGroup/utils/securedUserDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo";

export class UserManager {
  private readonly logger: LogFunctions;

  // Signed in user
  // Must be wrapped in an object because it is a proxy
  private signedInUser: { value: ISignedInUser | null };
  public onSignedInUserChangedCallback: SignedInUserChangedCallback;

  // User Account Storage
  // Must be wrapped in an object because it too is a proxy
  private userAccountStorage: { value: UserAccountStorage | null };
  public onUserAccountStorageChangedCallback: UserAccountStorageChangedCallback;
  private onUserAccountStorageOpenChangedCallback: UserAccountStorageOpenChangedCallback;

  // User Data Storage
  private onUserDataStoragesChangedCallback: (userDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff) => void;

  // Open User Data Storage Visibility Groups
  private OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS: Map<UUID, Buffer>;
  private onOpenUserDataStorageVisibilityGroupsChangedCallback: (
    userDataStorageVisibilityGroupInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff
  ) => void;

  private readonly PASSWORD_SALT_LENGTH = 32;

  public constructor(
    logger: LogFunctions,
    onSignedInUserChangedCallback?: SignedInUserChangedCallback,
    onUserAccountStorageChangedCallback?: UserAccountStorageChangedCallback,
    onUserAccountStorageOpenChangedCallback?: UserAccountStorageOpenChangedCallback,
    onUserDataStoragesChangedCallback?: (userDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff) => void,
    onOpenUserDataStorageVisibilityGroupsChangedCallback?: (
      userDataStorageVisibilityGroupsInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff
    ) => void
  ) {
    // Loggers
    this.logger = logger;
    this.logger.debug("Initialising new User Manager.");
    // Signed in user
    this.onSignedInUserChangedCallback =
      onSignedInUserChangedCallback ??
      ((): void => {
        this.logger.silly("No signed in user changed callback set.");
      });
    // Signed in user proxy that performs validation and calls the change callback when required
    this.signedInUser = new Proxy<{ value: ISignedInUser | null }>(
      { value: null },
      {
        set: (target: { value: ISignedInUser | null }, property: string | symbol, value: unknown): boolean => {
          if (property !== "value") {
            throw new Error(`Cannot set property "${String(property)}" on signed in user. Only "value" property can be set! No-op set`);
          }
          if (value !== null && !isSignedInUserValid(value)) {
            throw new Error(`Value must be null or a valid signed in user object! No-op set`);
          }
          const NEW_PUBLIC_SIGNED_IN_USER: IPublicSignedInUser | null = value === null ? null : signedInUserToPublicSignedInUser(value, this.logger);
          if (isDeepStrictEqual(target[property], value)) {
            this.logger.warn(`Signed in user already had this value: ${JSON.stringify(NEW_PUBLIC_SIGNED_IN_USER, null, 2)}. No-op set.`);
            this.onSignedInUserChangedCallback(NEW_PUBLIC_SIGNED_IN_USER);
            return true;
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
            this.logger.info("Set signed in user to null (signed out).");
          } else {
            this.logger.info(`Set signed in user to: ${JSON.stringify(NEW_PUBLIC_SIGNED_IN_USER, null, 2)} (signed in).`);
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
            this.onUserAccountStorageChangedCallback(value.getUserAccountStorageInfo());
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
    // User Data Storage Visibility groups
    this.OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS = new Map<UUID, Buffer>();
    this.onOpenUserDataStorageVisibilityGroupsChangedCallback =
      onOpenUserDataStorageVisibilityGroupsChangedCallback ??
      ((): void => {
        this.logger.silly("No User Data Storage Visibility Groups changed callback set.");
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

  public isUserAccountStorageClosed(): boolean {
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    const IS_CLOSED: boolean = this.userAccountStorage.value.isClosed();
    this.logger.debug(`Getting User Account Storage closed status: ${IS_CLOSED.toString()}.`);
    return IS_CLOSED;
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

  private deriveDataEncryptionAESKey(plainTextPassword: string, salt: Buffer): Buffer {
    this.logger.debug("Deriving data encryption AES key.");
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

  public generateRandomUserDataStorageVisibilityGroupId(): UUID {
    this.logger.debug("Generating random User Data Storage Visibility Group ID.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    let dataStorageVisibilityGroupId: UUID = randomUUID({ disableEntropyCache: true });
    this.logger.debug(`Checking User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}" availability.`);
    while (!this.userAccountStorage.value.isUserDataStorageVisibilityGroupIdAvailable(dataStorageVisibilityGroupId)) {
      this.logger.debug(`User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}" not available. Generating a new random one.`);
      dataStorageVisibilityGroupId = randomUUID({ disableEntropyCache: true });
    }
    this.logger.debug(`Generated random User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}".`);
    return dataStorageVisibilityGroupId;
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    this.logger.debug(`Getting username for user ID "${userId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.getUsernameForUserId(userId);
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
    this.logger.debug(`Signing in user: "${userSignInPayload.username}".`);
    if (this.signedInUser.value !== null) {
      this.logger.warn(`A user is already signed in: "${JSON.stringify(this.getPublicSignedInUser())}".`);
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
      userDataAESKey: this.deriveDataEncryptionAESKey(userSignInPayload.password, Buffer.from(DATA_ENCRYPTION_KEY_SALT, "base64"))
    };
    return true;
  }

  public signOutUser(): IPublicSignedInUser | null {
    this.logger.debug("Signing out.");
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

  public getUserAccountStorageInfo(): IUserAccountStorageInfo | null {
    if (this.userAccountStorage.value === null) {
      return null;
    }
    return this.userAccountStorage.value.getUserAccountStorageInfo();
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
      throw new Error(`Cannot add User Data Storage Config to user "${userDataStorageConfig.userId}" because it does not exist`);
    }
    const SECURED_USER_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = userDataStorageConfigToSecuredUserDataStorageConfig(
      userDataStorageConfig,
      this.logger
    );
    const IS_ADDED_SUCCESSFULLY: boolean = this.userAccountStorage.value.addStorageSecuredUserDataStorageConfig(
      securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig(
        SECURED_USER_DATA_STORAGE_CONFIG,
        this.signedInUser.value.userDataAESKey,
        this.logger
      )
    );
    if (IS_ADDED_SUCCESSFULLY) {
      this.onUserDataStoragesChangedCallback({
        deleted: [],
        added: [
          securedUserDataStorageConfigToUserDataStorageInfo(
            SECURED_USER_DATA_STORAGE_CONFIG,
            this.getSecuredUserDataStorageVisibilityGroupForConfigId(SECURED_USER_DATA_STORAGE_CONFIG.storageId).name,
            this.logger
          )
        ]
      } satisfies IUserDataStoragesInfoChangedDiff);
    }
    return IS_ADDED_SUCCESSFULLY;
  }

  public addUserDataStorageVisibilityGroup(userDataStorageVisibilityGroup: IUserDataStorageVisibilityGroup): boolean {
    this.logger.debug(`Adding User Data Storage Visibility Group to user: "${userDataStorageVisibilityGroup.userId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("Cannot encrypt Secured User Data Storage Visibility Group with no signed in user");
    }
    if (this.signedInUser.value.userId !== userDataStorageVisibilityGroup.userId) {
      throw new Error(
        `User Data Storage Visibility Group user ID "${userDataStorageVisibilityGroup.userId}" does not match signed in user ID "${this.signedInUser.value.userId}"`
      );
    }
    if (this.userAccountStorage.value.isUserIdAvailable(userDataStorageVisibilityGroup.userId)) {
      throw new Error(`Cannot add User Data Storage Visibility Group to user "${userDataStorageVisibilityGroup.userId}" because it does not exist`);
    }
    const SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP: ISecuredUserDataStorageVisibilityGroup =
      userDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup(
        userDataStorageVisibilityGroup,
        this.PASSWORD_SALT_LENGTH,
        (visibilityPassword: string, visibilityPasswordSalt: Buffer): string => {
          return this.hashPassword(visibilityPassword, visibilityPasswordSalt, "User Data Storage Visibility Group").toString("base64");
        },
        this.logger
      );
    return this.userAccountStorage.value.addStorageSecuredUserDataStorageVisibilityGroup(
      securedUserDataStorageVisibilityGroupToStorageSecuredUserDataStorageVisibilityGroup(
        SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP,
        this.signedInUser.value.userDataAESKey,
        this.logger
      )
    );
  }

  // TODO: Exclude already open visibility groups
  public openUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupOpenRequest: IUserDataStorageVisibilityGroupsOpenRequest): number {
    this.logger.debug(`Opening User Data Storage Visibility Groups for user: "${userDataStorageVisibilityGroupOpenRequest.userIdToOpenFor}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("No signed in user");
    }
    if (this.signedInUser.value.userId !== userDataStorageVisibilityGroupOpenRequest.userIdToOpenFor) {
      throw new Error(
        `User Data Storage Visibility Group Open Request user ID "${userDataStorageVisibilityGroupOpenRequest.userIdToOpenFor}" does not match signed in user ID "${this.signedInUser.value.userId}"`
      );
    }
    if (this.userAccountStorage.value.isUserIdAvailable(userDataStorageVisibilityGroupOpenRequest.userIdToOpenFor)) {
      throw new Error(
        `Cannot open User Data Storage Visibility Groups for user "${userDataStorageVisibilityGroupOpenRequest.userIdToOpenFor}" because it does not exist`
      );
    }
    const NOT_OPEN_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS: ISecuredUserDataStorageVisibilityGroup[] =
      this.getSignedInUserSecuredUserDataStorageVisibilityGroups({
        includeIds: "all",
        excludeIds: this.OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS.size > 0 ? Array.from(this.OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS.keys()) : null
      });
    const NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO: IUserDataStorageVisibilityGroupInfo[] = [];
    // Try to match passwords for every secured user data storage visibility group
    NOT_OPEN_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS.map(
      (securedUserDataStorageVisibilityGroup: ISecuredUserDataStorageVisibilityGroup): void => {
        const ATTEMPTED_PASSWORD_HASH: Buffer = this.hashPassword(
          userDataStorageVisibilityGroupOpenRequest.password,
          Buffer.from(securedUserDataStorageVisibilityGroup.securedPassword.salt, "base64"),
          "User Data Storage Visibility Group attempted"
        );
        if (timingSafeEqual(ATTEMPTED_PASSWORD_HASH, Buffer.from(securedUserDataStorageVisibilityGroup.securedPassword.hash, "base64"))) {
          this.logger.debug("Password hashes match.");
          // Add to open user data storage visibility groups
          this.OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS.set(
            securedUserDataStorageVisibilityGroup.visibilityGroupId,
            this.deriveDataEncryptionAESKey(
              userDataStorageVisibilityGroupOpenRequest.password,
              Buffer.from(securedUserDataStorageVisibilityGroup.AESKeySalt, "base64")
            )
          );
          NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.push(
            securedUserDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(securedUserDataStorageVisibilityGroup, null)
          );
        }
      }
    );
    if (NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length) {
      this.onOpenUserDataStorageVisibilityGroupsChangedCallback({
        deleted: [],
        added: NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO
      } satisfies IUserDataStorageVisibilityGroupsInfoChangedDiff);
      return NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length;
    } else {
      this.logger.debug("No newly opened User Data Storage Visibility Groups.");
      return 0;
    }
  }

  public getSignedInUserSecuredUserDataStorageConfigs(options: {
    includeIds: UUID[] | "all";
    excludeIds: UUID[] | null;
    visibilityGroups: {
      includeIds: (UUID | null)[] | "all";
      excludeIds: UUID[] | null;
    };
  }): ISecuredUserDataStorageConfig[] {
    this.logger.debug("Getting signed in user's Secured User Data Storage Configs.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("Cannot decrypt Storage Secured User Data Storage Configs with no signed in user");
    }
    const STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS: IStorageSecuredUserDataStorageConfig[] =
      this.userAccountStorage.value.getStorageSecuredUserDataStorageConfigs({ ...options, userId: this.signedInUser.value.userId });
    return STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS.map(
      (storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): ISecuredUserDataStorageConfig => {
        if (this.signedInUser.value === null) {
          throw new Error("Cannot decrypt Storage Secured User Data Storage Configs with no signed in user");
        }
        return storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig(
          storageSecuredUserDataStorageConfig,
          this.signedInUser.value.userDataAESKey,
          null
        );
      }
    );
  }

  public getSignedInUserSecuredUserDataStorageVisibilityGroups(options: {
    includeIds: UUID[] | "all";
    excludeIds: UUID[] | null;
  }): ISecuredUserDataStorageVisibilityGroup[] {
    if (options.includeIds === "all") {
      this.logger.debug(`Getting all signed in user's Secured User Data Storage Visibility Groups.`);
    } else {
      this.logger.debug(`Getting ${options.includeIds.length.toString()} signed in user's Secured User Data Storage Visibility Groups.`);
    }
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("Cannot decrypt Storage Secured User Data Storage Visibility Groups with no signed in user");
    }
    const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS: IStorageSecuredUserDataStorageVisibilityGroup[] =
      this.userAccountStorage.value.getStorageSecuredUserDataStorageVisibilityGroups({ ...options, userId: this.signedInUser.value.userId });
    return STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS.map(
      (storageSecuredUserDataStorageVisibilityGroup: IStorageSecuredUserDataStorageVisibilityGroup): ISecuredUserDataStorageVisibilityGroup => {
        if (this.signedInUser.value === null) {
          throw new Error("Cannot decrypt Storage Secured User Data Storage Visibility Groups with no signed in user");
        }
        return storageSecuredUserDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup(
          storageSecuredUserDataStorageVisibilityGroup,
          this.signedInUser.value.userDataAESKey,
          null
        );
      }
    );
  }

  public getSignedInUserDataStoragesInfo(): IUserDataStorageInfo[] {
    this.logger.debug("Getting signed in user's User Data Storages Info.");
    const SECURED_USER_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = this.getSignedInUserSecuredUserDataStorageConfigs({
      includeIds: "all",
      excludeIds: null,
      visibilityGroups: {
        includeIds: [null, ...Array.from(this.OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS.keys())],
        excludeIds: null
      }
    });
    return SECURED_USER_DATA_STORAGE_CONFIGS.map((securedUserDataStorageConfig: ISecuredUserDataStorageConfig): IUserDataStorageInfo => {
      return securedUserDataStorageConfigToUserDataStorageInfo(
        securedUserDataStorageConfig,
        this.getSecuredUserDataStorageVisibilityGroupForConfigId(securedUserDataStorageConfig.storageId).name,
        null
      );
    });
    // TODO: Change isOpen to true on the configs that are open
    // TODO: Keep track of visibility passwords
  }

  public getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo(): IUserDataStorageVisibilityGroupInfo[] {
    this.logger.debug("Getting all signed in user's open User Data Storage Visibility Groups Info.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("No signed in user");
    }
    if (this.OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS.size === 0) {
      this.logger.debug("No open User Data Storage Visibility Groups.");
      return [];
    }
    const SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS: ISecuredUserDataStorageVisibilityGroup[] =
      this.getSignedInUserSecuredUserDataStorageVisibilityGroups({
        includeIds: Array.from(this.OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS.keys()),
        excludeIds: null
      });
    const USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO: IUserDataStorageVisibilityGroupInfo[] = SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS.map(
      (securedUserDataStorageVisibilityGroup: ISecuredUserDataStorageVisibilityGroup): IUserDataStorageVisibilityGroupInfo => {
        return securedUserDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(securedUserDataStorageVisibilityGroup, null);
      }
    );
    this.logger.debug(
      `Getting ${USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length.toString()} open User Data Storage Visibility Group${
        USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length === 1 ? "" : "s"
      } Info.`
    );
    return USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO;
  }

  private getSecuredUserDataStorageVisibilityGroupForConfigId(userDataStorageConfigId: UUID): ISecuredUserDataStorageVisibilityGroup {
    this.logger.debug(`Getting Secured User Data Storage Visibility Group for User Data Storage Config: "${userDataStorageConfigId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("No signed in user");
    }
    return storageSecuredUserDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup(
      this.userAccountStorage.value.getStorageSecuredUserDataStorageVisibilityGroupForConfigId(userDataStorageConfigId),
      this.signedInUser.value.userDataAESKey,
      null
    );
  }
}
