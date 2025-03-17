import { LogFunctions } from "electron-log";
import { timingSafeEqual, UUID } from "node:crypto";
import { ISignedInUser, isSignedInUserValid } from "@main/user/account/SignedInUser";
import { SignedInUserChangedCallback, UserAccountStorageChangedCallback, UserAccountStorageOpenChangedCallback } from "@shared/IPC/APIs/UserAPI";
import { isDeepStrictEqual } from "node:util";
import { IUserDataStorageConfig } from "./data/storage/config/UserDataStorageConfig";
import { IUserSignInPayload } from "./account/UserSignInPayload";
import { IUserSignUpPayload } from "./account/UserSignUpPayload";
import { UserAccountStorage } from "./account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { signedInUserToSignedInUserInfo } from "./account/utils/signedInUserToSignedInUserInfo";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IStorageSecuredUserDataStorageConfig } from "./data/storage/config/StorageSecuredUserDataStorageConfig";
import { userDataStorageConfigToSecuredUserDataStorageConfig } from "./data/storage/config/utils/userDataStorageConfigToSecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig } from "./data/storage/config/utils/securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig";
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
import { deriveAESKey } from "@main/utils/encryption/deriveAESKey";
import { hashPassword } from "@main/utils/encryption/hashPassword";
import { UserAuthenticator } from "./UserAuthenticator";
import { PASSWORD_SALT_LENGTH_BYTES } from "@main/utils/encryption/constants";

export class UserManager {
  private readonly logger: LogFunctions;

  private readonly AUTHENTICATOR: UserAuthenticator;

  // Signed in user
  // Must be wrapped in an object because it is a proxy
  private signedInUser: { value: ISignedInUser | null };
  private onSignedInUserChangedCallback: SignedInUserChangedCallback;

  // User Account Storage
  // Must be wrapped in an object because it too is a proxy
  private userAccountStorage: { value: UserAccountStorage | null };
  private onAccountStorageChangedCallback: UserAccountStorageChangedCallback;
  private onAccountStorageOpenChangedCallback: UserAccountStorageOpenChangedCallback;

  // Available User Data Storages
  // private availableDataStorages: { value: UserDataStorage[] } // TODO: Implement UserDataStorage
  private onAvailableDataStoragesChangedCallback: (availableUserDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff) => void;

  // Open User Data Storage Visibility Groups
  private OPEN_DATA_STORAGE_VISIBILITY_GROUPS: Map<UUID, Buffer>;
  private onOpenDataStorageVisibilityGroupsChangedCallback: (
    dataStorageVisibilityGroupsInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff
  ) => void;

  public constructor(
    logger: LogFunctions,
    userAuthenticatorLogger: LogFunctions,
    onSignedInUserChangedCallback?: SignedInUserChangedCallback,
    onUserAccountStorageChangedCallback?: UserAccountStorageChangedCallback,
    onUserAccountStorageOpenChangedCallback?: UserAccountStorageOpenChangedCallback,
    onAvailableUserDataStoragesChangedCallback?: (availableUserDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff) => void,
    onOpenUserDataStorageVisibilityGroupsChangedCallback?: (
      dataStorageVisibilityGroupsInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff
    ) => void
  ) {
    // Loggers
    this.logger = logger;
    this.logger.debug("Initialising new User Manager.");
    this.AUTHENTICATOR = new UserAuthenticator(userAuthenticatorLogger);
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
          const NEW_SIGNED_IN_USER_INFO: ISignedInUserInfo | null = value === null ? null : signedInUserToSignedInUserInfo(value, this.logger);
          if (isDeepStrictEqual(target[property], value)) {
            this.logger.warn(`Signed in user already had this value: ${JSON.stringify(NEW_SIGNED_IN_USER_INFO, null, 2)}. No-op set.`);
            this.onSignedInUserChangedCallback(NEW_SIGNED_IN_USER_INFO);
            return true;
          }
          // Corrupt data encryption key previous value was a signed in user
          if (target[property] !== null) {
            this.logger.info("Corrupting previous user data AES key buffer.");
            crypto.getRandomValues(target[property].userDataAESKey);
            this.closeUserDataStorageVisibilityGroups(Array.from(this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.keys()));
          } else {
            this.logger.info("No previous user data key buffer to corrupt.");
          }
          target[property] = value;
          if (value === null) {
            this.logger.info("Set signed in user to null (signed out).");
          } else {
            this.logger.info(`Set signed in user to: ${JSON.stringify(NEW_SIGNED_IN_USER_INFO, null, 2)} (signed in).`);
          }
          this.onSignedInUserChangedCallback(NEW_SIGNED_IN_USER_INFO);
          return true;
        }
      }
    );
    // User Account Storage
    this.onAccountStorageChangedCallback =
      onUserAccountStorageChangedCallback ??
      ((): void => {
        this.logger.silly("No User Account Storage changed callback set.");
      });
    this.onAccountStorageOpenChangedCallback =
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
            this.onAccountStorageChangedCallback(null);
          } else {
            this.logger.info(`Set "${value.name}" User Account Storage (ID "${value.storageId}") (available).`);
            this.onAccountStorageChangedCallback(value.getUserAccountStorageInfo());
            // Proxy the open function to invoke the changed callback
            type OpenFunctionType = typeof value.open;
            type OpenFunctionParametersType = Parameters<OpenFunctionType>;
            type OpenFunctionReturnType = ReturnType<OpenFunctionType>;
            value.open = new Proxy<OpenFunctionType>(value.open.bind(value), {
              apply: (target: OpenFunctionType, thisArg: unknown, argArray: OpenFunctionParametersType): OpenFunctionReturnType => {
                const IS_OPEN: boolean = value.isOpen();
                const NEW_IS_OPEN: boolean = Reflect.apply(target, thisArg, argArray);
                if (IS_OPEN !== NEW_IS_OPEN) {
                  this.onAccountStorageOpenChangedCallback(NEW_IS_OPEN);
                }
                return NEW_IS_OPEN;
              }
            });
            // Proxy the close function to invoke the changed callback
            type CloseFunctionType = typeof value.close;
            type CloseFunctionParametersType = Parameters<CloseFunctionType>;
            type CloseFunctionReturnType = ReturnType<CloseFunctionType>;
            value.close = new Proxy<CloseFunctionType>(value.close.bind(value), {
              apply: (target: CloseFunctionType, thisArg: unknown, argArray: CloseFunctionParametersType): CloseFunctionReturnType => {
                const IS_CLOSED: boolean = value.isClosed();
                const NEW_IS_CLOSED: boolean = Reflect.apply(target, thisArg, argArray);
                if (IS_CLOSED !== NEW_IS_CLOSED) {
                  this.onAccountStorageOpenChangedCallback(!NEW_IS_CLOSED); // IS_OPEN
                }
                return NEW_IS_CLOSED;
              }
            });
          }
          return true;
        }
      }
    );
    // User Data Storage
    this.onAvailableDataStoragesChangedCallback =
      onAvailableUserDataStoragesChangedCallback ??
      ((): void => {
        this.logger.silly("No User Data Storages changed callback set.");
      });
    // User Data Storage Visibility groups
    this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS = new Map<UUID, Buffer>();
    this.onOpenDataStorageVisibilityGroupsChangedCallback =
      onOpenUserDataStorageVisibilityGroupsChangedCallback ??
      ((): void => {
        this.logger.silly("No User Data Storage Visibility Groups changed callback set.");
      });
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
    return this.userAccountStorage.value.open();
  }

  public closeUserAccountStorage(): boolean {
    this.logger.debug("Closing User Account Storage.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.close();
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Getting username availability for username: "${username}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.isUsernameAvailable(username);
  }

  public isUserDataStorageVisibilityGroupNameAvailableForSignedInUser(name: string): boolean {
    this.logger.debug(`Getting User Data Storage Visibility Group name "${name}" availability for signed in user.`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("No signed in user");
    }
    // There is no method to directly get this from the account storage because it is encrypted
    const SECURED_VISIBILITY_GROUPS: ISecuredUserDataStorageVisibilityGroup[] = this.getSignedInUserSecuredUserDataStorageVisibilityGroups({
      includeIds: "all",
      excludeIds: null
    });
    for (const SECURED_VISIBILITY_GROUP of SECURED_VISIBILITY_GROUPS) {
      if (SECURED_VISIBILITY_GROUP.name === name) {
        return false;
      }
    }
    return true;
  }

  public generateRandomUserId(): UUID {
    this.logger.debug("Generating random User ID.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.generateRandomUserId();
  }

  public generateRandomUserDataStorageId(): UUID {
    this.logger.debug("Generating random User Data Storage ID.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.generateRandomUserDataStorageId();
  }

  public generateRandomUserDataStorageVisibilityGroupId(): UUID {
    this.logger.debug("Generating random User Data Storage Visibility Group ID.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.userAccountStorage.value.generateRandomUserDataStorageVisibilityGroupId();
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
    return this.AUTHENTICATOR.signUp(this.userAccountStorage.value, userSignUpPayload, (userPassword: string, userPasswordSalt: Buffer): string => {
      return hashPassword(userPassword, userPasswordSalt, this.logger, "user sign up").toString("base64");
    });
  }

  public signInUser(userSignInPayload: IUserSignInPayload): boolean {
    this.logger.debug(`Signing in user: "${userSignInPayload.username}".`);
    if (this.signedInUser.value !== null) {
      this.logger.warn(`A user is already signed in: "${JSON.stringify(this.getSignedInUserInfo())}".`);
    }
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.AUTHENTICATOR.signIn(this.userAccountStorage.value, userSignInPayload, this.signedInUser);
  }

  public signOutUser(): ISignedInUserInfo | null {
    this.logger.debug("Signing out.");
    return this.AUTHENTICATOR.signOut(this.signedInUser);
  }

  public getSignedInUserInfo(): ISignedInUserInfo | null {
    if (this.signedInUser.value === null) {
      return null;
    }
    return signedInUserToSignedInUserInfo(this.signedInUser.value, this.logger);
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
    let encryptionAESKey: Buffer;
    if (userDataStorageConfig.visibilityGroupId === null) {
      encryptionAESKey = this.signedInUser.value.userDataAESKey;
    } else {
      const VISIBILITY_GROUP_AES_KEY: Buffer | undefined = this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.get(userDataStorageConfig.visibilityGroupId);
      if (VISIBILITY_GROUP_AES_KEY === undefined) {
        throw new Error(
          `User Data Storage Visibility Group "${userDataStorageConfig.visibilityGroupId}" not open! Cannot encrypt new User Data Storage Config`
        );
      }
      encryptionAESKey = VISIBILITY_GROUP_AES_KEY;
    }
    const WAS_ADDED: boolean = this.userAccountStorage.value.addStorageSecuredUserDataStorageConfig(
      securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig(SECURED_USER_DATA_STORAGE_CONFIG, encryptionAESKey, this.logger)
    );
    if (WAS_ADDED) {
      const VISIBILITY_GROUP: ISecuredUserDataStorageVisibilityGroup | null = this.getSecuredUserDataStorageVisibilityGroupForConfigId(
        SECURED_USER_DATA_STORAGE_CONFIG.storageId
      );
      const VISIBILITY_GROUP_NAME: string | null = VISIBILITY_GROUP === null ? null : VISIBILITY_GROUP.name;
      this.onAvailableDataStoragesChangedCallback({
        removed: [],
        added: [securedUserDataStorageConfigToUserDataStorageInfo(SECURED_USER_DATA_STORAGE_CONFIG, VISIBILITY_GROUP_NAME, this.logger)]
      } satisfies IUserDataStoragesInfoChangedDiff);
    }
    return WAS_ADDED;
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
    // TODO: Delete this check?
    if (this.userAccountStorage.value.isUserIdAvailable(userDataStorageVisibilityGroup.userId)) {
      throw new Error(`Cannot add User Data Storage Visibility Group to user "${userDataStorageVisibilityGroup.userId}" because it does not exist`);
    }
    const SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP: ISecuredUserDataStorageVisibilityGroup =
      userDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup(
        userDataStorageVisibilityGroup,
        PASSWORD_SALT_LENGTH_BYTES,
        (visibilityPassword: string, visibilityPasswordSalt: Buffer): string => {
          return hashPassword(visibilityPassword, visibilityPasswordSalt, this.logger, "User Data Storage Visibility Group").toString("base64");
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
        excludeIds: this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.size > 0 ? Array.from(this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.keys()) : null
      });
    const NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO: IUserDataStorageVisibilityGroupInfo[] = [];
    // Try to match passwords for every secured user data storage visibility group
    NOT_OPEN_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS.map(
      (securedUserDataStorageVisibilityGroup: ISecuredUserDataStorageVisibilityGroup): void => {
        const ATTEMPTED_PASSWORD_HASH: Buffer = hashPassword(
          userDataStorageVisibilityGroupOpenRequest.password,
          Buffer.from(securedUserDataStorageVisibilityGroup.securedPassword.salt, "base64"),
          null
        );
        if (timingSafeEqual(ATTEMPTED_PASSWORD_HASH, Buffer.from(securedUserDataStorageVisibilityGroup.securedPassword.hash, "base64"))) {
          // Add to open user data storage visibility groups
          this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.set(
            securedUserDataStorageVisibilityGroup.visibilityGroupId,
            deriveAESKey(
              userDataStorageVisibilityGroupOpenRequest.password,
              Buffer.from(securedUserDataStorageVisibilityGroup.AESKeySalt, "base64"),
              null
            )
          );
          NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.push(
            securedUserDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(securedUserDataStorageVisibilityGroup, null)
          );
        }
      }
    );
    this.logger.debug(
      `Opened ${NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length.toString()} User Data Storage Visibility Group${
        NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length === 1 ? "" : "s"
      }.`
    );
    if (NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length > 0) {
      this.onOpenDataStorageVisibilityGroupsChangedCallback({
        removed: [],
        added: NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO
      } satisfies IUserDataStorageVisibilityGroupsInfoChangedDiff);
      this.onAvailableDataStoragesChangedCallback({
        removed: [],
        added: this.getSignedInUserSecuredUserDataStorageConfigs({
          includeIds: "all",
          excludeIds: null,
          visibilityGroups: {
            includeIds: NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.map(
              (newlyOpenedVisibilityGroupInfo: IUserDataStorageVisibilityGroupInfo): UUID => {
                return newlyOpenedVisibilityGroupInfo.visibilityGroupId as UUID;
              }
            ),
            excludeIds: null
          }
        }).map((securedUserDataStorageConfig: ISecuredUserDataStorageConfig): IUserDataStorageInfo => {
          if (securedUserDataStorageConfig.visibilityGroupId === null) {
            throw new Error(
              `User Data Storage Config "${securedUserDataStorageConfig.storageId}" extracted from User Account Storage on User Data Storage Visibility Group opening must have non-null Visibility Group ID`
            );
          }
          let visibilityGroupName: string | null = null;
          for (const NEWLY_OPENED_VISIBILITY_GROUP of NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO) {
            if (NEWLY_OPENED_VISIBILITY_GROUP.visibilityGroupId === securedUserDataStorageConfig.visibilityGroupId) {
              visibilityGroupName = NEWLY_OPENED_VISIBILITY_GROUP.name;
              break;
            }
          }
          if (visibilityGroupName === null) {
            throw new Error(
              `User Data Storage Visibility Group "${securedUserDataStorageConfig.visibilityGroupId}" name missing from newly opened User Data Storage Visibility Group list.`
            );
          }
          return securedUserDataStorageConfigToUserDataStorageInfo(securedUserDataStorageConfig, visibilityGroupName, null);
        })
      } satisfies IUserDataStoragesInfoChangedDiff);
    }
    return NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length;
  }

  public closeUserDataStorageVisibilityGroups(visibilityGroupIds: UUID[]): number {
    this.logger.debug(`Closing User Data Storage Visibility Groups. Count: ${visibilityGroupIds.length.toString()}.`);
    if (this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.size === 0) {
      this.logger.warn("No open User Data Storage Visibility Groups to close.");
      return 0;
    }
    if (visibilityGroupIds.length === 0) {
      this.logger.warn("Received empty list of User Data Storage Visibility Group IDs to close.");
      return 0;
    }
    // Filter any extra IDs
    const VISIBILITY_GROUP_IDS_TO_CLOSE: UUID[] = [];
    visibilityGroupIds.map((visibilityGroupId: UUID): void => {
      if (this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.has(visibilityGroupId)) {
        VISIBILITY_GROUP_IDS_TO_CLOSE.push(visibilityGroupId);
      } else {
        this.logger.warn(`User Data Storage Visibility Group ID "${visibilityGroupId}" not open. Skipping.`);
      }
    });
    const NOW_UNAVAILABLE_USER_DATA_STORAGE_CONFIG_IDS: UUID[] = this.getSignedInUserSecuredUserDataStorageConfigs({
      includeIds: "all",
      excludeIds: null,
      visibilityGroups: { includeIds: VISIBILITY_GROUP_IDS_TO_CLOSE, excludeIds: null }
    }).map((securedUserDataStorageConfig: ISecuredUserDataStorageConfig): UUID => {
      return securedUserDataStorageConfig.storageId;
    });
    // Corrupt AES keys and remove from open visibility groups map
    VISIBILITY_GROUP_IDS_TO_CLOSE.map((visibilityGroupId: UUID): void => {
      const DATA_ENCRYPTION_AES_KEY: Buffer | undefined = this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.get(visibilityGroupId);
      if (DATA_ENCRYPTION_AES_KEY === undefined) {
        this.logger.warn(`User Data Storage Visibility Group ID "${visibilityGroupId}" not open.`);
        return;
      }
      crypto.getRandomValues(DATA_ENCRYPTION_AES_KEY);
      this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.delete(visibilityGroupId);
    });
    this.logger.debug(
      `Closed ${VISIBILITY_GROUP_IDS_TO_CLOSE.length.toString()} User Data Storage Visibility Group${
        VISIBILITY_GROUP_IDS_TO_CLOSE.length === 1 ? "" : "s"
      }.`
    );
    // Execute on change functions
    if (VISIBILITY_GROUP_IDS_TO_CLOSE.length > 0) {
      this.onOpenDataStorageVisibilityGroupsChangedCallback({
        removed: VISIBILITY_GROUP_IDS_TO_CLOSE,
        added: []
      } satisfies IUserDataStorageVisibilityGroupsInfoChangedDiff);
      this.onAvailableDataStoragesChangedCallback({
        removed: NOW_UNAVAILABLE_USER_DATA_STORAGE_CONFIG_IDS,
        added: []
      } satisfies IUserDataStoragesInfoChangedDiff);
    }
    return VISIBILITY_GROUP_IDS_TO_CLOSE.length;
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
        // TODO: Make this a helper function
        let decryptionAESKey: Buffer;
        if (storageSecuredUserDataStorageConfig.visibilityGroupId === null) {
          decryptionAESKey = this.signedInUser.value.userDataAESKey;
        } else {
          const VISIBILITY_GROUP_DATA_DECRYPTION_AES_KEY: Buffer | undefined = this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.get(
            storageSecuredUserDataStorageConfig.visibilityGroupId
          );
          if (VISIBILITY_GROUP_DATA_DECRYPTION_AES_KEY === undefined) {
            throw new Error(
              `User Data Storage Visibility Group "${storageSecuredUserDataStorageConfig.visibilityGroupId}" missing from open User Data Storage Visibility Groups! Cannot decrypt User Data Storage Config`
            );
          }
          decryptionAESKey = VISIBILITY_GROUP_DATA_DECRYPTION_AES_KEY;
        }
        return storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig(storageSecuredUserDataStorageConfig, decryptionAESKey, null);
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

  public getAllSignedInUserAvailableDataStoragesInfo(): IUserDataStorageInfo[] {
    this.logger.debug("Getting all signed in user's available User Data Storages Info.");
    const SECURED_USER_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = this.getSignedInUserSecuredUserDataStorageConfigs({
      includeIds: "all",
      excludeIds: null,
      visibilityGroups: {
        includeIds: [null, ...Array.from(this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.keys())],
        excludeIds: null
      }
    });
    return SECURED_USER_DATA_STORAGE_CONFIGS.map((securedUserDataStorageConfig: ISecuredUserDataStorageConfig): IUserDataStorageInfo => {
      // TODO: Make this one call for all to not destroy the network
      const VISIBILITY_GROUP: ISecuredUserDataStorageVisibilityGroup | null = this.getSecuredUserDataStorageVisibilityGroupForConfigId(
        securedUserDataStorageConfig.storageId
      );
      const VISIBILITY_GROUP_NAME: string | null = VISIBILITY_GROUP === null ? null : VISIBILITY_GROUP.name;
      return securedUserDataStorageConfigToUserDataStorageInfo(securedUserDataStorageConfig, VISIBILITY_GROUP_NAME, null);
    });
    // TODO: Change isOpen to true on the configs that are open
  }

  public getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo(): IUserDataStorageVisibilityGroupInfo[] {
    this.logger.debug("Getting all signed in user's open User Data Storage Visibility Groups Info.");
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("No signed in user");
    }
    if (this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.size === 0) {
      this.logger.debug("No open User Data Storage Visibility Groups.");
      return [];
    }
    const SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS: ISecuredUserDataStorageVisibilityGroup[] =
      this.getSignedInUserSecuredUserDataStorageVisibilityGroups({
        includeIds: Array.from(this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.keys()),
        excludeIds: null
      });
    const USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO: IUserDataStorageVisibilityGroupInfo[] = SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS.map(
      (securedUserDataStorageVisibilityGroup: ISecuredUserDataStorageVisibilityGroup): IUserDataStorageVisibilityGroupInfo => {
        return securedUserDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(securedUserDataStorageVisibilityGroup, null);
      }
    );
    this.logger.debug(
      `Got ${USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length.toString()} open User Data Storage Visibility Group${
        USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length === 1 ? "" : "s"
      } Info.`
    );
    return USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO;
  }

  private getSecuredUserDataStorageVisibilityGroupForConfigId(userDataStorageConfigId: UUID): ISecuredUserDataStorageVisibilityGroup | null {
    this.logger.debug(`Getting Secured User Data Storage Visibility Group for User Data Storage Config: "${userDataStorageConfigId}".`);
    if (this.userAccountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser.value === null) {
      throw new Error("No signed in user");
    }
    const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP: IStorageSecuredUserDataStorageVisibilityGroup | null =
      this.userAccountStorage.value.getStorageSecuredUserDataStorageVisibilityGroupForConfigId(
        this.signedInUser.value.userId,
        userDataStorageConfigId
      );
    if (STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP === null) {
      return null;
    }
    return storageSecuredUserDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup(
      STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP,
      this.signedInUser.value.userDataAESKey,
      null
    );
  }
}
