import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";
import { ISignedInUser, isSignedInUserValid } from "@main/user/account/SignedInUser";
import { SignedInUserChangedCallback, UserAccountStorageChangedCallback, UserAccountStorageOpenChangedCallback } from "@shared/IPC/APIs/UserAPI";
import { isDeepStrictEqual } from "node:util";
import { IUserDataStorageConfig } from "../data/storage/config/UserDataStorageConfig";
import { IUserSignInPayload } from "../account/UserSignInPayload";
import { IUserSignUpPayload } from "../account/UserSignUpPayload";
import { UserAccountStorage } from "../account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { signedInUserToSignedInUserInfo } from "../account/utils/signedInUserToSignedInUserInfo";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { ISecuredUserDataStorageConfig } from "../data/storage/config/SecuredUserDataStorageConfig";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { IUserDataStorageVisibilityGroupConfig } from "../data/storage/visibilityGroup/config/UserDataStorageVisibilityGroupConfig";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "../data/storage/visibilityGroup/config/SecuredUserDataStorageVisibilityGroupConfig";
import { IUserDataStorageVisibilityGroupsOpenRequest } from "../data/storage/visibilityGroup/openRequest/UserDataStorageVisibilityGroupsOpenRequest";
import { IUserDataStorageVisibilityGroupsInfoChangedDiff } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { hashPassword } from "@main/utils/encryption/hashPassword";
import { UserAuthenticationService } from "./services/UserAuthenticationService";
import { UserDataStorage } from "../data/storage/UserDataStorage";
import { isUserDataStorageArray } from "../data/storage/utils/isUserDataStorageArray";
import { ISignedInUserProxy } from "./proxies/SignedInUserProxy";
import { IUserAccountStorageProxy } from "./proxies/UserAccountStorageProxy";
import { IAvailableUserDataStoragesProxy } from "./proxies/AvailableUserDataStoragesProxy";
import { UserControllerContext as UserControllerContext } from "./UserControllerContext";
import { UserAccountStorageService } from "./services/UserAccountStorageService";
import { UserDataStorageConfigService } from "./services/UserDataStorageConfigService";
import { UserDataStorageVisibilityGroupService } from "./services/UserDataStorageVisibilityGroupService";

export class UserController {
  private readonly logger: LogFunctions;

  private readonly CONTEXT: UserControllerContext;

  private readonly AUTH_SERVICE: UserAuthenticationService;
  private readonly ACCOUNT_STORAGE_SERVICE: UserAccountStorageService;
  private readonly DATA_STORAGE_CONFIG_SERVICE: UserDataStorageConfigService;
  private readonly DATA_STORAGE_VISIBILITY_GROUP_SERVICE: UserDataStorageVisibilityGroupService;

  // Signed in user
  private signedInUser: ISignedInUserProxy;
  private onSignedInUserChangedCallback: SignedInUserChangedCallback | null;

  // User Account Storage
  private accountStorage: IUserAccountStorageProxy;
  private onAccountStorageChangedCallback: UserAccountStorageChangedCallback | null;
  private onAccountStorageOpenChangedCallback: UserAccountStorageOpenChangedCallback | null;

  // Available User Data Storages
  private availableDataStorages: IAvailableUserDataStoragesProxy;
  private onAvailableDataStoragesChangedCallback: ((availableUserDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff) => void) | null;

  // Open User Data Storage Visibility Groups
  private OPEN_DATA_STORAGE_VISIBILITY_GROUPS: Map<UUID, Buffer>; // TODO: Hold entire visibility group, not just IDs
  private onOpenDataStorageVisibilityGroupsChangedCallback:
    | ((dataStorageVisibilityGroupsInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff) => void)
    | null;

  public constructor(
    logger: LogFunctions,
    authServiceLogger: LogFunctions,
    accountStorageServiceLogger: LogFunctions,
    dataStorageConfigServiceLogger: LogFunctions,
    dataStorageVisibilityGroupServiceLogger: LogFunctions,
    onSignedInUserChangedCallback: SignedInUserChangedCallback | null,
    onUserAccountStorageChangedCallback: UserAccountStorageChangedCallback | null,
    onUserAccountStorageOpenChangedCallback: UserAccountStorageOpenChangedCallback | null,
    onAvailableUserDataStoragesChangedCallback: ((availableUserDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff) => void) | null,
    onOpenUserDataStorageVisibilityGroupsChangedCallback:
      | ((dataStorageVisibilityGroupsInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff) => void)
      | null
  ) {
    // Loggers
    this.logger = logger;
    this.logger.debug("Initialising new User Controller.");
    // Signed in user
    this.onSignedInUserChangedCallback = onSignedInUserChangedCallback;
    // Signed in user proxy that performs validation and calls the change callback when required
    this.signedInUser = new Proxy<ISignedInUserProxy>(
      { value: null },
      {
        set: (target: ISignedInUserProxy, property: string | symbol, newValue: unknown): boolean => {
          if (property !== "value") {
            throw new Error(`Cannot set property "${String(property)}" on signed in user. Only "value" property can be set! No-op set`);
          }
          let frozenNewValue: Readonly<ISignedInUser> | null;
          if (newValue === null) {
            frozenNewValue = null;
          } else if (isSignedInUserValid(newValue)) {
            frozenNewValue = Object.freeze<ISignedInUser>(newValue);
          } else {
            throw new Error(`New value must be null or a valid signed in user object! No-op set`);
          }
          const NEW_SIGNED_IN_USER_INFO: ISignedInUserInfo | null =
            frozenNewValue === null ? null : signedInUserToSignedInUserInfo(frozenNewValue, this.logger);
          if (isDeepStrictEqual(target[property], frozenNewValue)) {
            throw new Error(`Signed in user already had this value: ${JSON.stringify(NEW_SIGNED_IN_USER_INFO, null, 2)}. No-op set`);
          }
          // Corrupt data encryption key previous value was a signed in user
          if (target[property] !== null) {
            this.logger.info("Corrupting previous user data AES key buffer.");
            crypto.getRandomValues(target[property].userDataAESKey);
            this.closeUserDataStorageVisibilityGroups(Array.from(this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.keys()));
          } else {
            this.logger.info("No previous user data key buffer to corrupt.");
          }
          target[property] = frozenNewValue;
          if (frozenNewValue === null) {
            this.logger.info("Set signed in user to null (signed out).");
          } else {
            this.logger.info(`Set signed in user to: ${JSON.stringify(NEW_SIGNED_IN_USER_INFO, null, 2)} (signed in).`);
          }
          this.onSignedInUserChangedCallback?.(NEW_SIGNED_IN_USER_INFO);
          // TODO: Make this work on sign in, out
          // this.availableDataStorages.value = this.getSignedInUserSecuredUserDataStorageConfigs({
          //   includeIds: "all",
          //   excludeIds: null,
          //   visibilityGroups: {
          //     includeIds: [null, ...Array.from(this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.keys())],
          //     excludeIds: null
          //   }
          // });
          return true;
        }
      }
    );
    // User Account Storage
    this.onAccountStorageChangedCallback = onUserAccountStorageChangedCallback;
    this.onAccountStorageOpenChangedCallback = onUserAccountStorageOpenChangedCallback;
    // User Account Storage proxy that performs validation and calls the change callback when required
    this.accountStorage = new Proxy<IUserAccountStorageProxy>(
      { value: null },
      {
        set: (target: IUserAccountStorageProxy, property: string | symbol, newValue: unknown): boolean => {
          if (property !== "value") {
            throw new Error(`Cannot set property "${String(property)}" on User Account Storage. Only "value" property can be set! No-op set`);
          }
          if (newValue !== null && !(newValue instanceof UserAccountStorage)) {
            throw new Error(`New value must be null or an instance of User Account Storage! No-op set`);
          }
          target[property] = newValue;
          if (newValue === null) {
            this.logger.info("Set User Account Storage to null (unavailable).");
            this.onAccountStorageChangedCallback?.(null);
          } else {
            this.logger.info(`Set "${newValue.name}" User Account Storage (ID "${newValue.storageId}") (available).`);
            this.onAccountStorageChangedCallback?.(newValue.getInfo());
            // Proxy the open function to invoke the changed callback
            type OpenFunctionType = typeof newValue.open;
            type OpenFunctionParametersType = Parameters<OpenFunctionType>;
            type OpenFunctionReturnType = ReturnType<OpenFunctionType>;
            newValue.open = new Proxy<OpenFunctionType>(newValue.open.bind(newValue), {
              apply: (target: OpenFunctionType, thisArg: unknown, argArray: OpenFunctionParametersType): OpenFunctionReturnType => {
                const IS_OPEN: boolean = newValue.isOpen();
                const NEW_IS_OPEN: boolean = Reflect.apply(target, thisArg, argArray);
                if (IS_OPEN !== NEW_IS_OPEN) {
                  this.onAccountStorageOpenChangedCallback?.(NEW_IS_OPEN);
                }
                return NEW_IS_OPEN;
              }
            });
            // Proxy the close function to invoke the changed callback
            type CloseFunctionType = typeof newValue.close;
            type CloseFunctionParametersType = Parameters<CloseFunctionType>;
            type CloseFunctionReturnType = ReturnType<CloseFunctionType>;
            newValue.close = new Proxy<CloseFunctionType>(newValue.close.bind(newValue), {
              apply: (target: CloseFunctionType, thisArg: unknown, argArray: CloseFunctionParametersType): CloseFunctionReturnType => {
                const IS_CLOSED: boolean = newValue.isClosed();
                const NEW_IS_CLOSED: boolean = Reflect.apply(target, thisArg, argArray);
                if (IS_CLOSED !== NEW_IS_CLOSED) {
                  this.onAccountStorageOpenChangedCallback?.(!NEW_IS_CLOSED); // IS_OPEN
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
    this.availableDataStorages = new Proxy<IAvailableUserDataStoragesProxy>(
      { value: [] satisfies readonly UserDataStorage[] },
      {
        set: (target: IAvailableUserDataStoragesProxy, property: string | symbol, newValue: unknown): boolean => {
          if (property !== "value") {
            throw new Error(`Cannot set property "${String(property)}" on available User Data Storages. Only "value" property can be set! No-op set`);
          }
          if (!isUserDataStorageArray(newValue)) {
            throw new Error(`New value must be an array of User Data Storages! No-op set`);
          }
          const PREV_VALUE: UserDataStorage[] = target[property];
          // TODO: Delete this
          // Disallow modifying the array in memory, forcing the set of a new value and triggering the on update callback
          // target[property] = new Proxy<UserDataStorage[]>(newValue, {
          //   get: (target: UserDataStorage[], property: string | symbol): unknown => {
          //     if (property === "length" || Number.isInteger(Number(property))) {
          //       return target[property];
          //     }
          //     throw new Error(
          //       'Only "length" and index property access is allowed on available User Data Storages array proxy! For method access, create a new array! No-op get'
          //     );
          //   }
          // });
          // Prevent getting differences if the arrays have the same reference
          if (this.onAvailableDataStoragesChangedCallback && PREV_VALUE !== newValue) {
            const ONLY_IN_PREV_VALUE: UserDataStorage[] = PREV_VALUE.filter((prevValue: UserDataStorage): boolean => {
              return !newValue.some((newValue: UserDataStorage): boolean => {
                return isDeepStrictEqual(prevValue, newValue);
              });
            });
            const ONLY_IN_NEW_VALUE: UserDataStorage[] = newValue.filter((newValue: UserDataStorage): boolean => {
              return !PREV_VALUE.some((prevValue: UserDataStorage): boolean => {
                return isDeepStrictEqual(newValue, prevValue);
              });
            });
            this.logger.error(`Only in prev available Data Storages: ${JSON.stringify(ONLY_IN_PREV_VALUE, null, 2)}.`); // TODO: Delete this
            this.logger.error(`Only in new available Data Storages: ${JSON.stringify(ONLY_IN_NEW_VALUE, null, 2)}.`); // TODO: Delete this
            if (ONLY_IN_PREV_VALUE.length > 0 || ONLY_IN_NEW_VALUE.length > 0)
              this.onAvailableDataStoragesChangedCallback({
                removed: ONLY_IN_PREV_VALUE.map((nowRemovedValue: UserDataStorage): UUID => {
                  return nowRemovedValue.storageId;
                }),
                added: ONLY_IN_NEW_VALUE.map((newlyAddedvalue: UserDataStorage): IUserDataStorageInfo => {
                  return newlyAddedvalue.getInfo();
                })
              } satisfies IUserDataStoragesInfoChangedDiff);
          }
          this.logger.error(`New available Data Storages: ${JSON.stringify(newValue, null, 2)}.`); // TODO: Delete this
          return true;
        }
      }
    );
    this.onAvailableDataStoragesChangedCallback = onAvailableUserDataStoragesChangedCallback;
    // User Data Storage Visibility groups
    this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS = new Map<UUID, Buffer>();
    this.onOpenDataStorageVisibilityGroupsChangedCallback = onOpenUserDataStorageVisibilityGroupsChangedCallback;

    // TODO: Only this should eventually remain in this constructor
    this.CONTEXT = new UserControllerContext(this.accountStorage, this.signedInUser, { value: [] });
    this.AUTH_SERVICE = new UserAuthenticationService(authServiceLogger, this.CONTEXT);
    this.ACCOUNT_STORAGE_SERVICE = new UserAccountStorageService(accountStorageServiceLogger, this.CONTEXT);
    this.DATA_STORAGE_CONFIG_SERVICE = new UserDataStorageConfigService(dataStorageConfigServiceLogger, this.CONTEXT);
    this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE = new UserDataStorageVisibilityGroupService(dataStorageVisibilityGroupServiceLogger, this.CONTEXT);
  }

  public isAccountStorageOpen(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.isAccountStorageOpen();
  }

  public isAccountStorageClosed(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.isAccountStorageClosed();
  }

  public isAccountStorageSet(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.isAccountStorageSet();
  }

  public setAccountStorage(newAccountStorage: UserAccountStorage): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.setAccountStorage(newAccountStorage);
  }

  public unsetAccountStorage(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.unsetAccountStorage();
  }

  public openAccountStorage(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.openAccountStorage();
  }

  public closeAccountStorage(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.closeAccountStorage();
  }

  public isUsernameAvailable(username: string): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.isUsernameAvailable(username);
  }

  public isDataStorageVisibilityGroupNameAvailableForSignedInUser(name: string): boolean {
    this.logger.debug(`Getting User Data Storage Visibility Group name "${name}" availability for signed in user.`);
    if (this.signedInUser.value === null) {
      throw new Error("No signed in user");
    }
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.isDataStorageVisibilityGroupNameAvailableForUserId(
      name,
      this.signedInUser.value.userId,
      this.signedInUser.value.userDataAESKey
    );
  }

  public generateRandomUserId(): UUID {
    return this.ACCOUNT_STORAGE_SERVICE.generateRandomUserId();
  }

  public generateRandomDataStorageId(): UUID {
    return this.DATA_STORAGE_CONFIG_SERVICE.generateRandomDataStorageId();
  }

  public generateRandomDataStorageVisibilityGroupId(): UUID {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.generateRandomDataStorageVisibilityGroupId();
  }

  public getUserCount(): number {
    return this.ACCOUNT_STORAGE_SERVICE.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    return this.ACCOUNT_STORAGE_SERVICE.getUsernameForUserId(userId);
  }

  public signUpUser(userSignUpPayload: IUserSignUpPayload): boolean {
    return this.AUTH_SERVICE.signUp(userSignUpPayload, (userPassword: string, userPasswordSalt: Buffer): string => {
      return hashPassword(userPassword, userPasswordSalt, this.logger, "user sign up").toString("base64");
    });
  }

  public signInUser(userSignInPayload: IUserSignInPayload): boolean {
    return this.AUTH_SERVICE.signIn(userSignInPayload);
  }

  public signOutUser(): ISignedInUserInfo | null {
    return this.AUTH_SERVICE.signOut();
  }

  public getSignedInUserInfo(): ISignedInUserInfo | null {
    return this.AUTH_SERVICE.getSignedInUserInfo();
  }

  public getAccountStorageInfo(): IUserAccountStorageInfo | null {
    return this.ACCOUNT_STORAGE_SERVICE.getAccountStorageInfo();
  }

  public addUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): boolean {
    return this.DATA_STORAGE_CONFIG_SERVICE.addUserDataStorageConfig(userDataStorageConfig);
  }

  public addUserDataStorageVisibilityGroupConfig(dataStorageVisibilityGroup: IUserDataStorageVisibilityGroupConfig): boolean {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.addUserDataStorageVisibilityGroupConfig(dataStorageVisibilityGroup);
  }

  public openUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupOpenRequest: IUserDataStorageVisibilityGroupsOpenRequest): number {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.openUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupOpenRequest);
  }

  public closeUserDataStorageVisibilityGroups(visibilityGroupIds: UUID[]): number {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.closeUserDataStorageVisibilityGroups(visibilityGroupIds);
  }

  public getSignedInUserSecuredUserDataStorageConfigs(options: {
    includeIds: UUID[] | "all";
    excludeIds: UUID[] | null;
    visibilityGroups: {
      includeIds: (UUID | null)[] | "all";
      excludeIds: UUID[] | null;
    };
  }): ISecuredUserDataStorageConfig[] {
    return this.DATA_STORAGE_CONFIG_SERVICE.getSignedInUserSecuredUserDataStorageConfigs(options);
  }

  public getSignedInUserSecuredUserDataStorageVisibilityGroupConfigs(options: {
    includeIds: UUID[] | "all";
    excludeIds: UUID[] | null;
  }): ISecuredUserDataStorageVisibilityGroupConfig[] {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.getSignedInUserSecuredUserDataStorageVisibilityGroupConfigs(options);
  }

  public getAllSignedInUserAvailableDataStoragesInfo(): IUserDataStorageInfo[] {
    return this.DATA_STORAGE_CONFIG_SERVICE.getAllSignedInUserAvailableDataStoragesInfo();
  }

  public getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo(): IUserDataStorageVisibilityGroupInfo[] {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo();
  }
}
