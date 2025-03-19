import { LogFunctions } from "electron-log";
import { IUserAccountServiceContext } from "./services/UserAccountService";
import { IUserAccountStorageServiceContext } from "./services/UserAccountStorageService";
import { IUserAuthenticationServiceContext } from "./services/UserAuthenticationService";
import { IUserDataStorageConfigServiceContext } from "./services/UserDataStorageConfigService";
import { IUserDataStorageVisibilityGroupServiceContext } from "./services/UserDataStorageVisibilityGroupService";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { IUserDataStorageVisibilityGroupsInfoChangedDiff } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";
import { UUID } from "node:crypto";
import { ISignedInUser, isSignedInUserValid } from "../account/SignedInUser";
import { signedInUserToSignedInUserInfo } from "../account/utils/signedInUserToSignedInUserInfo";
import { isDeepStrictEqual } from "node:util";
import { UserAccountStorage } from "../account/storage/UserAccountStorage";
import { UserDataStorage } from "../data/storage/UserDataStorage";
import { isUserDataStorageArray } from "../data/storage/utils/isUserDataStorageArray";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import {
  isUserDataStorageVisibilityGroupArray,
  IUserDataStorageVisibilityGroup
} from "../data/storage/visibilityGroup/UserDataStorageVisibilityGroup";
import { ISignedInUserProxy } from "./proxies/SignedInUserProxy";
import { IUserAccountStorageProxy } from "./proxies/UserAccountStorageProxy";
import { IAvailableUserDataStoragesProxy } from "./proxies/AvailableUserDataStoragesProxy";
import { IOpenUserDataStorageVisibilityGroupsProxy } from "./proxies/OpenUserDataStorageVisibilityGroupsProxy";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo } from "../data/storage/visibilityGroup/utils/userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo";

export interface IUserContextHandlers {
  onSignedInUserChangedCallback: ((newSignedInUserInfo: ISignedInUserInfo | null) => void) | null;
  onUserAccountStorageChangedCallback: ((newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void) | null;
  onUserAccountStorageOpenChangedCallback: ((newIsUserAccountStorageOpen: boolean) => void) | null;
  onAvailableUserDataStoragesChangedCallback: ((availableUserDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff) => void) | null;
  onOpenUserDataStorageVisibilityGroupsChangedCallback:
    | ((dataStorageVisibilityGroupsInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff) => void)
    | null;
}

export class UserContext {
  private readonly logger: LogFunctions;

  private signedInUser: ISignedInUser | null; //ISignedInUserProxy;
  private accountStorage: UserAccountStorage | null; //IUserAccountStorageProxy;
  private availableDataStorages: UserDataStorage[]; //IAvailableUserDataStoragesProxy;
  private openDataStorageVisibilityGroups: IUserDataStorageVisibilityGroup[]; //IOpenUserDataStorageVisibilityGroupsProxy;

  public getSignedInUser(): ISignedInUser | null {
    return this.signedInUser;
  }

  public setSignedInUser(newSignedInUser: ISignedInUser | null): void {
    // TODO: See what the proxy was doing here
    this.signedInUser = newSignedInUser;
  }

  public getAccountStorage(): UserAccountStorage | null {
    return this.accountStorage;
  }

  public setAccountStorage(newAccountStorage: UserAccountStorage | null): void {
    // TODO: See what the proxy was doing here
    this.accountStorage = newAccountStorage;
  }

  public getAvailableDataStorages(): UserDataStorage[] {
    return this.availableDataStorages;
  }

  public addAvailableDataStorages(newDataStorages: UserDataStorage[]): void {
    // TODO: See what the proxy was doing here
    this.availableDataStorages.push(...newDataStorages);
  }

  public getOpenDataStorageVisibilityGroups(): IUserDataStorageVisibilityGroup[] {
    return this.openDataStorageVisibilityGroups;
  }

  public addOpenDataStorageVisibilityGroups(newVisibilityGroups: IUserDataStorageVisibilityGroup[]): void {
    // TODO: See what the proxy was doing here
    this.openDataStorageVisibilityGroups.push(...newVisibilityGroups);
  }

  public removeOpenDataStorageVisibilityGroups(visibilityGroupIds: UUID[]): number {
    // TODO: See what the proxy was doing here
    return 0;
  }

  public constructor(logger: LogFunctions, contextHandlers: IUserContextHandlers) {
    this.logger = logger;
    this.logger.info("Initialising new User Context.");
    // Signed in user
    this.signedInUser = null;
    // new Proxy<ISignedInUserProxy>(
    //   { value: null } satisfies ISignedInUserProxy,
    //   {
    //     set: (target: ISignedInUserProxy, property: string | symbol, newValue: unknown): boolean => {
    //       if (property !== "value") {
    //         throw new Error(`Cannot set property "${String(property)}" on signed in user. Only "value" property can be set! No-op set`);
    //       }
    //       let frozenNewSignedInUser: Readonly<ISignedInUser> | null;
    //       let newSignedInUserInfo: ISignedInUserInfo | null;
    //       if (newValue === null) {
    //         frozenNewSignedInUser = null;
    //         newSignedInUserInfo = null;
    //       } else if (isSignedInUserValid(newValue)) {
    //         frozenNewSignedInUser = Object.freeze<ISignedInUser>(newValue);
    //         newSignedInUserInfo = signedInUserToSignedInUserInfo(frozenNewSignedInUser, this.logger);
    //       } else {
    //         throw new Error(`New value must be null or a valid signed in user object! No-op set`);
    //       }
    //       if (isDeepStrictEqual(target[property], frozenNewSignedInUser)) {
    //         throw new Error(`Signed in user already had this value: ${JSON.stringify(newSignedInUserInfo, null, 2)}. No-op set`);
    //       }
    //       if (target[property] !== null) {
    //         this.logger.info("Corrupting previous user data AES key buffer.");
    //         crypto.getRandomValues(target[property].userDataAESKey);
    //         this.availableDataStorages.value = []; // TODO: Investigate effects of these
    //         this.openDataStorageVisibilityGroups.value = []; // Clear all open data storage visibility groups
    //       } else {
    //         this.logger.info("No previous user data key buffer to corrupt.");
    //       }
    //       target[property] = frozenNewSignedInUser;
    //       this.logger.info(
    //         `Set signed in user to: ${
    //           frozenNewSignedInUser === null ? "null (signed out)" : `${JSON.stringify(newSignedInUserInfo, null, 2)} (signed in)`
    //         }`
    //       );
    //       contextHandlers.onSignedInUserChangedCallback?.(newSignedInUserInfo);
    //       // TODO: Make this work on sign in, out
    //       // this.availableDataStorages.value = this.getSignedInUserSecuredUserDataStorageConfigs({
    //       //   includeIds: "all",
    //       //   excludeIds: null,
    //       //   visibilityGroups: {
    //       //     includeIds: [null, ...Array.from(this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.keys())],
    //       //     excludeIds: null
    //       //   }
    //       // });
    //       return true;
    //     }
    //   } satisfies ProxyHandler<ISignedInUserProxy>
    // );
    // User Account Storage
    this.accountStorage = null;
    // new Proxy<IUserAccountStorageProxy>(
    //   { value: null } satisfies IUserAccountStorageProxy,
    //   {
    //     set: (target: IUserAccountStorageProxy, property: string | symbol, newValue: unknown): boolean => {
    //       if (property !== "value") {
    //         throw new Error(`Cannot set property "${String(property)}" on User Account Storage. Only "value" property can be set! No-op set`);
    //       }
    //       let newAccountStorageInfo: IUserAccountStorageInfo | null;
    //       if (newValue === null) {
    //         newAccountStorageInfo = null;
    //       } else if (newValue instanceof UserAccountStorage) {
    //         newAccountStorageInfo = newValue.getInfo();
    //         // Proxy the open function to invoke the changed callback
    //         type OpenFunctionType = typeof newValue.open;
    //         type OpenFunctionParametersType = Parameters<OpenFunctionType>;
    //         type OpenFunctionReturnType = ReturnType<OpenFunctionType>;
    //         newValue.open = new Proxy<OpenFunctionType>(newValue.open.bind(newValue), {
    //           apply: (target: OpenFunctionType, thisArg: unknown, argArray: OpenFunctionParametersType): OpenFunctionReturnType => {
    //             const IS_OPEN: boolean = newValue.isOpen();
    //             const NEW_IS_OPEN: boolean = Reflect.apply(target, thisArg, argArray);
    //             if (IS_OPEN !== NEW_IS_OPEN) {
    //               contextHandlers.onUserAccountStorageOpenChangedCallback?.(NEW_IS_OPEN);
    //             }
    //             return NEW_IS_OPEN;
    //           }
    //         } satisfies ProxyHandler<OpenFunctionType>);
    //         // Proxy the close function to invoke the changed callback
    //         type CloseFunctionType = typeof newValue.close;
    //         type CloseFunctionParametersType = Parameters<CloseFunctionType>;
    //         type CloseFunctionReturnType = ReturnType<CloseFunctionType>;
    //         newValue.close = new Proxy<CloseFunctionType>(newValue.close.bind(newValue), {
    //           apply: (target: CloseFunctionType, thisArg: unknown, argArray: CloseFunctionParametersType): CloseFunctionReturnType => {
    //             const IS_CLOSED: boolean = newValue.isClosed();
    //             const NEW_IS_CLOSED: boolean = Reflect.apply(target, thisArg, argArray);
    //             if (IS_CLOSED !== NEW_IS_CLOSED) {
    //               contextHandlers.onUserAccountStorageOpenChangedCallback?.(!NEW_IS_CLOSED); // IS_OPEN
    //             }
    //             return NEW_IS_CLOSED;
    //           }
    //         } satisfies ProxyHandler<CloseFunctionType>);
    //       } else {
    //         throw new Error(`New value must be null or an instance of User Account Storage! No-op set`);
    //       }
    //       target[property] = newValue;
    //       this.logger.info(
    //         `Set User Account Storage to: ${
    //           newValue === null ? "null (unavailable)" : `${JSON.stringify(newAccountStorageInfo, null, 2)} (available)`
    //         }`
    //       );
    //       contextHandlers.onUserAccountStorageChangedCallback?.(newAccountStorageInfo);
    //       return true;
    //     }
    //   } satisfies ProxyHandler<IUserAccountStorageProxy>
    // );
    // User Data Storage
    this.availableDataStorages = [];
    // new Proxy<IAvailableUserDataStoragesProxy>(
    //   { value: [] satisfies readonly UserDataStorage[] } satisfies IAvailableUserDataStoragesProxy,
    //   {
    //     set: (target: IAvailableUserDataStoragesProxy, property: string | symbol, newValue: unknown): boolean => {
    //       if (property !== "value") {
    //         throw new Error(`Cannot set property "${String(property)}" on available User Data Storages. Only "value" property can be set! No-op set`);
    //       }
    //       if (!isUserDataStorageArray(newValue)) {
    //         throw new Error(`New value must be an array of User Data Storages! No-op set`);
    //       }
    //       const PREV_VALUE: UserDataStorage[] = target[property];
    //       // Disallow modifying the array in memory, forcing the set of a new value and triggering the on update callback
    //       target[property] = new Proxy<UserDataStorage[]>(newValue, {
    //         get: (target: UserDataStorage[], property: string | symbol): unknown => {
    //           if (property === "length" || Number.isInteger(Number(property))) {
    //             return target[property];
    //           }
    //           throw new Error(
    //             'Only "length" and index property access is allowed on available User Data Storages array proxy! For method access, create a new array! No-op get'
    //           );
    //         }
    //       } satisfies ProxyHandler<UserDataStorage[]>);
    //       // Prevent getting differences if the arrays have the same reference
    //       if (contextHandlers.onAvailableUserDataStoragesChangedCallback && PREV_VALUE !== newValue) {
    //         const ONLY_IN_PREV_VALUE: UserDataStorage[] = PREV_VALUE.filter((prevValue: UserDataStorage): boolean => {
    //           return !newValue.some((newValue: UserDataStorage): boolean => {
    //             return isDeepStrictEqual(prevValue, newValue);
    //           });
    //         });
    //         const ONLY_IN_NEW_VALUE: UserDataStorage[] = newValue.filter((newValue: UserDataStorage): boolean => {
    //           return !PREV_VALUE.some((prevValue: UserDataStorage): boolean => {
    //             return isDeepStrictEqual(newValue, prevValue);
    //           });
    //         });
    //         this.logger.error(`Only in prev available Data Storages: ${JSON.stringify(ONLY_IN_PREV_VALUE, null, 2)}.`); // TODO: Delete this
    //         this.logger.error(`Only in new available Data Storages: ${JSON.stringify(ONLY_IN_NEW_VALUE, null, 2)}.`); // TODO: Delete this
    //         if (ONLY_IN_PREV_VALUE.length > 0 || ONLY_IN_NEW_VALUE.length > 0)
    //           contextHandlers.onAvailableUserDataStoragesChangedCallback({
    //             removed: ONLY_IN_PREV_VALUE.map((nowRemovedValue: UserDataStorage): UUID => {
    //               return nowRemovedValue.storageId;
    //             }),
    //             added: ONLY_IN_NEW_VALUE.map((newlyAddedvalue: UserDataStorage): IUserDataStorageInfo => {
    //               return newlyAddedvalue.getInfo();
    //             })
    //           } satisfies IUserDataStoragesInfoChangedDiff);
    //       }
    //       this.logger.error(`New available Data Storages: ${JSON.stringify(newValue, null, 2)}.`); // TODO: Delete this
    //       return true;
    //     }
    //   } satisfies ProxyHandler<IAvailableUserDataStoragesProxy>
    // );
    // User Data Storage Visibility Groups
    this.openDataStorageVisibilityGroups = [];
    // new Proxy<IOpenUserDataStorageVisibilityGroupsProxy>(
    //   { value: [] satisfies IUserDataStorageVisibilityGroup[] } satisfies IOpenUserDataStorageVisibilityGroupsProxy,
    //   {
    //     set: (target: IOpenUserDataStorageVisibilityGroupsProxy, property: string | symbol, newValue: unknown): boolean => {
    //       if (property !== "value") {
    //         throw new Error(
    //           `Cannot set property "${String(property)}" on open User Data Storage Visibility Groups. Only "value" property can be set! No-op set`
    //         );
    //       }
    //       if (!isUserDataStorageVisibilityGroupArray(newValue)) {
    //         throw new Error(`New value must be an array of User Data Storage Visibility Groups! No-op set`);
    //       }
    //       const PREV_VALUE: IUserDataStorageVisibilityGroup[] = target[property];
    //       // Disallow modifying the array in memory, forcing the set of a new value and triggering the on update callback
    //       target[property] = new Proxy<IUserDataStorageVisibilityGroup[]>(newValue, {
    //         get: (target: IUserDataStorageVisibilityGroup[], property: string | symbol): unknown => {
    //           if (property === "length" || Number.isInteger(Number(property))) {
    //             return target[property];
    //           }
    //           throw new Error(
    //             'Only "length" and index property access is allowed on open User Data Storage Visibility Groups array proxy! For method access, create a new array! No-op get'
    //           );
    //         }
    //       } satisfies ProxyHandler<IUserDataStorageVisibilityGroup[]>);
    //       if (contextHandlers.onOpenUserDataStorageVisibilityGroupsChangedCallback && PREV_VALUE !== newValue) {
    //         const ONLY_IN_PREV_VALUE: IUserDataStorageVisibilityGroup[] = PREV_VALUE.filter((prevValue: IUserDataStorageVisibilityGroup): boolean => {
    //           return !newValue.some((newValue: IUserDataStorageVisibilityGroup): boolean => {
    //             return isDeepStrictEqual(prevValue, newValue);
    //           });
    //         });
    //         const ONLY_IN_NEW_VALUE: IUserDataStorageVisibilityGroup[] = newValue.filter((newValue: IUserDataStorageVisibilityGroup): boolean => {
    //           return !PREV_VALUE.some((prevValue: IUserDataStorageVisibilityGroup): boolean => {
    //             return isDeepStrictEqual(newValue, prevValue);
    //           });
    //         });
    //         this.logger.error(`Only in prev open Data Storage Visibility Groups: ${JSON.stringify(ONLY_IN_PREV_VALUE, null, 2)}.`); // TODO: Delete this
    //         this.logger.error(`Only in new open Data Storage Visibility Groups: ${JSON.stringify(ONLY_IN_NEW_VALUE, null, 2)}.`); // TODO: Delete this
    //         if (ONLY_IN_PREV_VALUE.length > 0 || ONLY_IN_NEW_VALUE.length > 0)
    //           contextHandlers.onOpenUserDataStorageVisibilityGroupsChangedCallback({
    //             removed: ONLY_IN_PREV_VALUE.map((nowRemovedValue: IUserDataStorageVisibilityGroup): UUID => {
    //               return nowRemovedValue.visibilityGroupId;
    //             }),
    //             added: ONLY_IN_NEW_VALUE.map((newlyAddedvalue: IUserDataStorageVisibilityGroup): IUserDataStorageVisibilityGroupInfo => {
    //               return userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(newlyAddedvalue, null);
    //             })
    //           } satisfies IUserDataStorageVisibilityGroupsInfoChangedDiff);
    //       }
    //       this.logger.error(`New open Data Storage Visibility Groups: ${JSON.stringify(newValue, null, 2)}.`); // TODO: Delete this
    //       return true;
    //     }
    //   } satisfies ProxyHandler<IOpenUserDataStorageVisibilityGroupsProxy>
    // );
  }
}

export class UserContextProvider {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: UserContext;

  public constructor(logger: LogFunctions, context: UserContext) {
    this.logger = logger;
    this.logger.info("Initialising new User Context Provider.");
    this.CONTEXT = context;
  }

  public getUserAccountServiceContext(): IUserAccountServiceContext {
    this.logger.debug("Providing User Account Service Context.");
    return {
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this)
    } satisfies IUserAccountServiceContext;
  }

  public getUserAccountStorageServiceContext(): IUserAccountStorageServiceContext {
    this.logger.debug("Providing User Account Storage Service Context.");
    return {
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this),
      setAccountStorage: this.CONTEXT.setAccountStorage.bind(this)
    } satisfies IUserAccountStorageServiceContext;
  }

  public getUserAuthenticationServiceContext(): IUserAuthenticationServiceContext {
    this.logger.debug("Providing User Authentication Service Context.");
    return {
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this),
      getSignedInUser: this.CONTEXT.getSignedInUser.bind(this),
      setSignedInUser: this.CONTEXT.setSignedInUser.bind(this)
    } satisfies IUserAuthenticationServiceContext;
  }

  public getUserDataStorageConfigServiceContext(): IUserDataStorageConfigServiceContext {
    this.logger.debug("Providing User Data Storage Config Service Context.");
    return {
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this),
      getSignedInUser: this.CONTEXT.getSignedInUser.bind(this),
      getAvailableDataStorages: this.CONTEXT.getAvailableDataStorages.bind(this),
      addAvailableDataStorages: this.CONTEXT.addAvailableDataStorages.bind(this),
      getOpenDataStorageVisibilityGroups: this.CONTEXT.getOpenDataStorageVisibilityGroups.bind(this)
    } satisfies IUserDataStorageConfigServiceContext;
  }

  public getUserDataStorageVisibilityGroupServiceContext(): IUserDataStorageVisibilityGroupServiceContext {
    this.logger.debug("Providing User Data Storage Visibility Group Service Context.");
    return {
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this),
      getSignedInUser: this.CONTEXT.getSignedInUser.bind(this),
      getOpenDataStorageVisibilityGroups: this.CONTEXT.getOpenDataStorageVisibilityGroups.bind(this),
      addOpenDataStorageVisibilityGroups: this.CONTEXT.addOpenDataStorageVisibilityGroups.bind(this),
      removeOpenDataStorageVisibilityGroups: this.CONTEXT.removeOpenDataStorageVisibilityGroups.bind(this)
    } satisfies IUserDataStorageVisibilityGroupServiceContext;
  }
}
