import { LogFunctions } from "electron-log";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { IUserDataStorageVisibilityGroupsInfoChangedDiff } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";
import { UUID } from "node:crypto";
import { ISignedInUser, isValidSignedInUser } from "../../account/SignedInUser";
import { signedInUserToSignedInUserInfo } from "../../account/utils/signedInUserToSignedInUserInfo";
import { isDeepStrictEqual } from "node:util";
import { UserAccountStorage } from "../../account/storage/UserAccountStorage";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import {
  isValidUserDataStorageVisibilityGroupArray,
  IUserDataStorageVisibilityGroup
} from "../../data/storage/visibilityGroup/UserDataStorageVisibilityGroup";

import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo } from "../../data/storage/visibilityGroup/utils/userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo";
import { isValidUUIDArray } from "@main/utils/dataValidation/isValidUUID";
import { IStorageSecuredUserDataStorageConfig } from "../../data/storage/config/StorageSecuredUserDataStorageConfig";
import { storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig } from "../../data/storage/config/utils/storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig";
import { ISecuredUserDataStorageConfig } from "../../data/storage/config/SecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToUserDataStorageInfo } from "@main/user/data/storage/config/utils/securedUserDataStorageConfigToUserDataStorageInfo";

export interface IUserContextHandlers {
  onSignedInUserChangedCallback: ((newSignedInUserInfo: ISignedInUserInfo | null) => void) | null;
  onUserAccountStorageChangedCallback: ((newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void) | null;
  onUserAccountStorageInfoChangedCallback: ((newUserAccountStorageInfo: IUserAccountStorageInfo) => void) | null;
  onAvailableUserDataStorageConfigsChangedCallback: ((availableUserDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff) => void) | null;
  onOpenUserDataStorageVisibilityGroupsChangedCallback:
    | ((dataStorageVisibilityGroupsInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff) => void)
    | null;
}

export class UserContext {
  private readonly logger: LogFunctions;
  private readonly HANDLERS: IUserContextHandlers;

  private signedInUser: Readonly<ISignedInUser> | null;
  private accountStorage: UserAccountStorage | null;
  private availableDataStorageConfigs: ISecuredUserDataStorageConfig[];
  private openDataStorageVisibilityGroups: IUserDataStorageVisibilityGroup[];

  public constructor(logger: LogFunctions, contextHandlers: IUserContextHandlers) {
    this.logger = logger;
    this.logger.info("Initialising new User Context.");
    this.HANDLERS = contextHandlers;
    this.signedInUser = null;
    this.accountStorage = null;
    this.availableDataStorageConfigs = [];
    this.openDataStorageVisibilityGroups = [];
  }

  public getSignedInUser(): Readonly<ISignedInUser> | null {
    this.logger.info("Getting signed in user.");
    return this.signedInUser;
  }

  public setSignedInUser(newSignedInUser: ISignedInUser | null): boolean {
    this.logger.info("Setting new signed in user.");
    let frozenNewSignedInUser: Readonly<ISignedInUser> | null;
    let newSignedInUserInfo: ISignedInUserInfo | null;
    if (newSignedInUser === null) {
      frozenNewSignedInUser = null;
      newSignedInUserInfo = null;
    } else if (isValidSignedInUser(newSignedInUser)) {
      frozenNewSignedInUser = Object.freeze<ISignedInUser>(newSignedInUser);
      newSignedInUserInfo = signedInUserToSignedInUserInfo(frozenNewSignedInUser, this.logger);
    } else {
      throw new Error("Invalid new signed in user");
    }
    if (isDeepStrictEqual(this.signedInUser, frozenNewSignedInUser)) {
      this.logger.warn(`Signed in user already had this value: ${JSON.stringify(newSignedInUserInfo, null, 2)}. No-op set.`);
      if (frozenNewSignedInUser !== null) {
        this.logger.info("Corrupting new signed in user's data AES key buffer.");
        crypto.getRandomValues(frozenNewSignedInUser.userDataAESKey);
      } else {
        this.logger.info("No new signed in user data AES key buffer to corrupt.");
      }
      return false;
    }
    if (this.signedInUser !== null) {
      this.logger.info("Corrupting previous' signed in user data AES key buffer.");
      crypto.getRandomValues(this.signedInUser.userDataAESKey);
      this.clearOpenDataStorageVisibilityGroups();
      this.clearAvailableDataStorageConfigs();
    } else {
      this.logger.info("No previous signed in user data AES key buffer to corrupt.");
    }
    this.signedInUser = frozenNewSignedInUser;
    this.logger.info(
      `Set signed in user to: ${
        frozenNewSignedInUser === null ? "null (signed out)" : `${JSON.stringify(newSignedInUserInfo, null, 2)} (signed in)`
      }.`
    );
    this.HANDLERS.onSignedInUserChangedCallback?.(newSignedInUserInfo);
    if (this.signedInUser !== null) {
      this.addAvailableDataStorageConfigs(this.getAllPublicDataStorageConfigsFromAccountStorage());
    }
    return true;
  }

  public getAccountStorage(): UserAccountStorage | null {
    this.logger.info("Getting User Account Storage.");
    return this.accountStorage;
  }

  public setAccountStorage(newAccountStorage: UserAccountStorage | null): boolean {
    this.logger.info("Setting new User Account Storage.");
    let newAccountStorageInfo: IUserAccountStorageInfo | null;
    if (newAccountStorage === null) {
      newAccountStorageInfo = null;
    } else if (newAccountStorage instanceof UserAccountStorage) {
      newAccountStorageInfo = newAccountStorage.getInfo();
      // // Proxy the open function to invoke the changed callback
      // type OpenFunctionType = typeof newAccountStorage.open;
      // type OpenFunctionParametersType = Parameters<OpenFunctionType>;
      // type OpenFunctionReturnType = ReturnType<OpenFunctionType>;
      // newAccountStorage.open = new Proxy<OpenFunctionType>(newAccountStorage.open.bind(newAccountStorage), {
      //   apply: (target: OpenFunctionType, thisArg: unknown, argArray: OpenFunctionParametersType): OpenFunctionReturnType => {
      //     if (this.HANDLERS.onUserAccountStorageOpenChangedCallback) {
      //       const IS_OPEN_BEFORE: boolean = newAccountStorage.isOpen();
      //       const IS_OPEN_AFTER: OpenFunctionReturnType = Reflect.apply(target, thisArg, argArray);
      //       if (IS_OPEN_BEFORE !== IS_OPEN_AFTER) {
      //         this.HANDLERS.onUserAccountStorageOpenChangedCallback(IS_OPEN_AFTER);
      //       }
      //       return IS_OPEN_AFTER;
      //     }
      //     return Reflect.apply(target, thisArg, argArray);
      //   }
      // } satisfies ProxyHandler<OpenFunctionType>);
      // // Proxy the close function to invoke the changed callback
      // type CloseFunctionType = typeof newAccountStorage.close;
      // type CloseFunctionParametersType = Parameters<CloseFunctionType>;
      // type CloseFunctionReturnType = ReturnType<CloseFunctionType>;
      // newAccountStorage.close = new Proxy<CloseFunctionType>(newAccountStorage.close.bind(newAccountStorage), {
      //   apply: (target: CloseFunctionType, thisArg: unknown, argArray: CloseFunctionParametersType): CloseFunctionReturnType => {
      //     if (this.HANDLERS.onUserAccountStorageOpenChangedCallback) {
      //       const IS_CLOSED_BEFORE: boolean = newAccountStorage.isClosed();
      //       const IS_CLOSED_AFTER: CloseFunctionReturnType = Reflect.apply(target, thisArg, argArray);
      //       if (IS_CLOSED_BEFORE !== IS_CLOSED_AFTER) {
      //         this.HANDLERS.onUserAccountStorageOpenChangedCallback(!IS_CLOSED_AFTER); // == IS_OPEN_AFTER
      //       }
      //       return IS_CLOSED_AFTER;
      //     }
      //     return Reflect.apply(target, thisArg, argArray);
      //   }
      // } satisfies ProxyHandler<CloseFunctionType>);
      // Proxy the add data storage config function to add it to available data storages on success
      type AddStorageSecuredUserDataStorageConfigType = typeof newAccountStorage.addSecuredUserDataStorageConfig;
      type AddStorageSecuredUserDataStorageConfigParametersType = Parameters<AddStorageSecuredUserDataStorageConfigType>;
      type AddStorageSecuredUserDataStorageConfigReturnType = ReturnType<AddStorageSecuredUserDataStorageConfigType>;
      newAccountStorage.addSecuredUserDataStorageConfig = new Proxy<AddStorageSecuredUserDataStorageConfigType>(
        newAccountStorage.addSecuredUserDataStorageConfig.bind(newAccountStorage),
        {
          apply: (
            target: AddStorageSecuredUserDataStorageConfigType,
            thisArg: unknown,
            argArray: AddStorageSecuredUserDataStorageConfigParametersType
          ): AddStorageSecuredUserDataStorageConfigReturnType => {
            const WAS_SECURED_DATA_STORAGE_CONFIG_ADDED: boolean = Reflect.apply(target, thisArg, argArray);
            if (WAS_SECURED_DATA_STORAGE_CONFIG_ADDED) {
              this.addAvailableDataStorageConfigs([argArray[0]]);
            }
            return WAS_SECURED_DATA_STORAGE_CONFIG_ADDED;
          }
        } satisfies ProxyHandler<AddStorageSecuredUserDataStorageConfigType>
      );
    } else {
      throw new Error(`Invalid new User Account Storage`);
    }
    this.accountStorage = newAccountStorage;
    this.logger.info(
      `Set User Account Storage to: ${
        newAccountStorage === null ? "null (unavailable)" : `${JSON.stringify(newAccountStorageInfo, null, 2)} (available)`
      }`
    );
    this.HANDLERS.onUserAccountStorageChangedCallback?.(newAccountStorageInfo);
    // TODO: Maybe make all not open storage configs unavailable when this closes? This should be done on the front end
    return true;
  }

  public getAvailableDataStorageConfigs(): ISecuredUserDataStorageConfig[] {
    this.logger.info("Getting available User Data Storage Configs.");
    return this.availableDataStorageConfigs;
  }

  public addAvailableDataStorageConfigs(newDataStorageConfigs: ISecuredUserDataStorageConfig[]): number {
    this.logger.info(
      `Adding ${newDataStorageConfigs.length.toString()} new available User Data Storage Config${newDataStorageConfigs.length === 1 ? "" : "s"}.`
    );
    // TODO: This
    // if (!isValidUserDataStorageArray(newDataStorageConfigs)) {
    //   throw new Error("Invalid new User Data Storages array");
    // }
    if (newDataStorageConfigs.length === 0) {
      this.logger.warn("Given no new User Data Storage Configs to add.");
      return 0;
    }
    const NEW_DATA_STORAGES: ISecuredUserDataStorageConfig[] = newDataStorageConfigs.filter(
      (newDataStorage: ISecuredUserDataStorageConfig): boolean => {
        const IS_ALREADY_AVAILABLE: boolean = this.availableDataStorageConfigs.some(
          (availableDataStorage: ISecuredUserDataStorageConfig): boolean => {
            return newDataStorage.storageId === availableDataStorage.storageId;
          }
        );
        if (IS_ALREADY_AVAILABLE) {
          this.logger.warn(`Skip adding already available given User Data Storage Config "${newDataStorage.storageId}".`);
        }
        return !IS_ALREADY_AVAILABLE; // Only keep new data storage configs that are NOT already available
      }
    );
    this.availableDataStorageConfigs.push(...NEW_DATA_STORAGES);
    this.logger.info(
      `Added ${NEW_DATA_STORAGES.length.toString()} new available User Data Storage Config${NEW_DATA_STORAGES.length === 1 ? "" : "s"}.`
    );
    if (NEW_DATA_STORAGES.length > 0) {
      this.HANDLERS.onAvailableUserDataStorageConfigsChangedCallback?.({
        removed: [],
        added: NEW_DATA_STORAGES.map((newDataStorageConfig: ISecuredUserDataStorageConfig): IUserDataStorageInfo => {
          return securedUserDataStorageConfigToUserDataStorageInfo(newDataStorageConfig, "VISGROUPNAME", null); // TODO: Send visibility group ID instead of name
        })
      } satisfies IUserDataStoragesInfoChangedDiff);
    }
    return NEW_DATA_STORAGES.length;
  }

  public removeAvailableDataStorageConfigs(dataStorageConfigIds: UUID[]): number {
    this.logger.info(
      `Removing ${dataStorageConfigIds.length.toString()} available User Data Storage Config${dataStorageConfigIds.length === 1 ? "" : "s"}.`
    );
    if (this.availableDataStorageConfigs.length === 0) {
      this.logger.info("No available User Data Storage Configs to remove from.");
      return 0;
    }
    if (!isValidUUIDArray(dataStorageConfigIds)) {
      throw new Error("Invalid User Data Storage Config ID array");
    }
    if (dataStorageConfigIds.length === 0) {
      this.logger.warn("Given no User Data Storage Config IDs to remove.");
      return 0;
    }
    const DATA_STORAGE_IDS: UUID[] = dataStorageConfigIds.filter((dataStorageId: UUID): boolean => {
      const IS_AVAILABLE: boolean = this.availableDataStorageConfigs.some((availableDataStorage: ISecuredUserDataStorageConfig): boolean => {
        return dataStorageId === availableDataStorage.storageId;
      });
      if (!IS_AVAILABLE) {
        this.logger.warn(`Skip removing unavailable given User Data Storage Config "${dataStorageId}".`);
      }
      return IS_AVAILABLE;
    });
    for (let idx = this.availableDataStorageConfigs.length - 1; idx >= 0; idx--) {
      const AVAILABLE_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = this.availableDataStorageConfigs[idx];
      if (DATA_STORAGE_IDS.includes(AVAILABLE_DATA_STORAGE_CONFIG.storageId)) {
        // AVAILABLE_DATA_STORAGE_CONFIG.close(); // TODO: CLEANUP?
        this.availableDataStorageConfigs.splice(idx, 1); // Remove from array in-place
      }
    }
    this.logger.info(`Removed ${DATA_STORAGE_IDS.length.toString()} available User Data Storage Config${DATA_STORAGE_IDS.length === 1 ? "" : "s"}.`);
    if (DATA_STORAGE_IDS.length > 0) {
      this.HANDLERS.onAvailableUserDataStorageConfigsChangedCallback?.({
        removed: DATA_STORAGE_IDS,
        added: []
      } satisfies IUserDataStoragesInfoChangedDiff);
    }
    return DATA_STORAGE_IDS.length;
  }

  public clearAvailableDataStorageConfigs(): number {
    this.logger.info("Clearing available User Data Storage Configs.");
    if (this.availableDataStorageConfigs.length === 0) {
      this.logger.info("No available User Data Storage Configs to clear.");
      return 0;
    }
    const AVAILABLE_DATA_STORAGE_CONFIG_IDS: UUID[] = this.availableDataStorageConfigs.map(
      (availableDataStorage: ISecuredUserDataStorageConfig): UUID => {
        // availableDataStorage.close(); // TODO: Cleanup?
        return availableDataStorage.storageId;
      }
    );
    this.availableDataStorageConfigs = [];
    this.logger.info(`Cleared available User Data Storage Configs (${AVAILABLE_DATA_STORAGE_CONFIG_IDS.length.toString()}).`);
    this.HANDLERS.onAvailableUserDataStorageConfigsChangedCallback?.({
      removed: AVAILABLE_DATA_STORAGE_CONFIG_IDS,
      added: []
    } satisfies IUserDataStoragesInfoChangedDiff);
    return AVAILABLE_DATA_STORAGE_CONFIG_IDS.length;
  }

  public getOpenDataStorageVisibilityGroups(): IUserDataStorageVisibilityGroup[] {
    this.logger.info("Getting open User Data Storage Visibility Groups.");
    return this.openDataStorageVisibilityGroups;
  }

  public addOpenDataStorageVisibilityGroups(newVisibilityGroups: IUserDataStorageVisibilityGroup[]): number {
    this.logger.info(
      `Adding ${newVisibilityGroups.length.toString()} new open User Data Storage Visibility Group${newVisibilityGroups.length === 1 ? "" : "s"}.`
    );
    if (!isValidUserDataStorageVisibilityGroupArray(newVisibilityGroups)) {
      throw new Error("Invalid User Data Storage Visibility Group array!");
    }
    if (newVisibilityGroups.length === 0) {
      this.logger.warn("Given no new User Data Storage Visibility Groups to add.");
      return 0;
    }
    const NEW_VISIBILITY_GROUPS: IUserDataStorageVisibilityGroup[] = newVisibilityGroups.filter(
      (newVisibilityGroup: IUserDataStorageVisibilityGroup): boolean => {
        const IS_ALREADY_OPEN: boolean = this.openDataStorageVisibilityGroups.some(
          (openVisibilityGroup: IUserDataStorageVisibilityGroup): boolean => {
            return newVisibilityGroup.visibilityGroupId === openVisibilityGroup.visibilityGroupId;
          }
        );
        if (IS_ALREADY_OPEN) {
          this.logger.warn(`Skip adding already open User Data Storage Visibility Group "${newVisibilityGroup.visibilityGroupId}".`);
        }
        return !IS_ALREADY_OPEN; // Only keep new data storage visibility groups that are NOT already open
      }
    );
    this.openDataStorageVisibilityGroups.push(...NEW_VISIBILITY_GROUPS);
    this.logger.info(
      `Added ${NEW_VISIBILITY_GROUPS.length.toString()} new open User Data Storage Visibility Group${NEW_VISIBILITY_GROUPS.length === 1 ? "" : "s"}.`
    );
    if (NEW_VISIBILITY_GROUPS.length > 0) {
      this.HANDLERS.onOpenUserDataStorageVisibilityGroupsChangedCallback?.({
        removed: [],
        added: NEW_VISIBILITY_GROUPS.map((newVisibilityGroup: IUserDataStorageVisibilityGroup): IUserDataStorageVisibilityGroupInfo => {
          return userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(newVisibilityGroup, null);
        })
      } satisfies IUserDataStorageVisibilityGroupsInfoChangedDiff);
      this.addAvailableDataStorageConfigs(this.getAllDataStorageConfigsFromAccountStorageForVisibilityGroups(NEW_VISIBILITY_GROUPS));
    }
    return NEW_VISIBILITY_GROUPS.length;
  }

  public removeOpenDataStorageVisibilityGroups(visibilityGroupIds: UUID[]): number {
    this.logger.info(
      `Removing ${visibilityGroupIds.length.toString()} open User Data Storage Visibility Group${visibilityGroupIds.length === 1 ? "" : "s"}.`
    );
    if (this.openDataStorageVisibilityGroups.length === 0) {
      this.logger.info("No open User Data Storage Visibility Groups to remove from.");
      return 0;
    }
    if (!isValidUUIDArray(visibilityGroupIds)) {
      throw new Error("Invalid User Data Storage Visibility Group ID array");
    }
    if (visibilityGroupIds.length === 0) {
      this.logger.warn("Given no User Data Storage Visibility Group IDs to remove.");
      return 0;
    }
    const VISIBILITY_GROUP_IDS: UUID[] = visibilityGroupIds.filter((visibilityGroupId: UUID): boolean => {
      const IS_OPEN: boolean = this.openDataStorageVisibilityGroups.some((openVisibilityGroup: IUserDataStorageVisibilityGroup): boolean => {
        return visibilityGroupId === openVisibilityGroup.visibilityGroupId;
      });
      if (!IS_OPEN) {
        this.logger.warn(`Skip removing missing given open User Data Storage Visibility Group "${visibilityGroupId}".`);
      }
      return IS_OPEN;
    });
    for (let i = this.openDataStorageVisibilityGroups.length - 1; i >= 0; i--) {
      const OPEN_VISIBILITY_GROUP: IUserDataStorageVisibilityGroup = this.openDataStorageVisibilityGroups[i];
      if (VISIBILITY_GROUP_IDS.includes(OPEN_VISIBILITY_GROUP.visibilityGroupId)) {
        crypto.getRandomValues(OPEN_VISIBILITY_GROUP.AESKey); // Corrupt AES key
        this.openDataStorageVisibilityGroups.splice(i, 1); // Remove from array in-place
      }
    }
    this.logger.info(
      `Removed ${VISIBILITY_GROUP_IDS.length.toString()} available User Data Storage Visibility Group${VISIBILITY_GROUP_IDS.length === 1 ? "" : "s"}.`
    );
    if (VISIBILITY_GROUP_IDS.length > 0) {
      this.HANDLERS.onOpenUserDataStorageVisibilityGroupsChangedCallback?.({
        removed: VISIBILITY_GROUP_IDS,
        added: []
      } satisfies IUserDataStorageVisibilityGroupsInfoChangedDiff);
      this.removeAvailableDataStorageConfigs(this.getAllDataStorageIdsForVisibilityGroupIds(VISIBILITY_GROUP_IDS));
    }
    return VISIBILITY_GROUP_IDS.length;
  }

  public clearOpenDataStorageVisibilityGroups(): number {
    this.logger.info("Clearing open User Data Storage Visibility Groups.");
    if (this.openDataStorageVisibilityGroups.length === 0) {
      this.logger.info("No open User Data Storage Visibility Groups to clear.");
      return 0;
    }
    const OPEN_VISIBILITY_GROUP_IDS: UUID[] = this.openDataStorageVisibilityGroups.map(
      (openVisibilityGroup: IUserDataStorageVisibilityGroup): UUID => {
        crypto.getRandomValues(openVisibilityGroup.AESKey);
        return openVisibilityGroup.visibilityGroupId;
      }
    );
    this.openDataStorageVisibilityGroups = [];
    this.logger.info(`Cleared open User Data Storage Visibility Groups (${OPEN_VISIBILITY_GROUP_IDS.length.toString()}).`);
    this.HANDLERS.onOpenUserDataStorageVisibilityGroupsChangedCallback?.({
      removed: OPEN_VISIBILITY_GROUP_IDS,
      added: []
    } satisfies IUserDataStorageVisibilityGroupsInfoChangedDiff);
    this.removeAvailableDataStorageConfigs(this.getAllDataStorageIdsForVisibilityGroupIds(OPEN_VISIBILITY_GROUP_IDS));
    return OPEN_VISIBILITY_GROUP_IDS.length;
  }

  private getAllDataStorageIdsForVisibilityGroupIds(visibilityGroupIds: UUID[]): UUID[] {
    this.logger.info(
      `Getting all available User Data Storage IDs for ${visibilityGroupIds.length.toString()} User Data Storage Visibility Group ID${
        visibilityGroupIds.length === 1 ? "" : "s"
      }.`
    );
    const DATA_STORAGE_IDS: UUID[] = [];
    for (const VISIBILITY_GROUP_ID of visibilityGroupIds) {
      for (const AVAILABLE_DATA_STORAGE of this.availableDataStorageConfigs) {
        if (VISIBILITY_GROUP_ID === AVAILABLE_DATA_STORAGE.visibilityGroupId) {
          DATA_STORAGE_IDS.push(AVAILABLE_DATA_STORAGE.storageId);
        }
      }
    }
    this.logger.info(`Got ${DATA_STORAGE_IDS.length.toString()}!`);
    return DATA_STORAGE_IDS;
  }

  private getAllPublicDataStorageConfigsFromAccountStorage(): ISecuredUserDataStorageConfig[] {
    this.logger.info("Getting all public User Data Storage Configs from User Account Storage.");
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser === null) {
      throw new Error("Null signed in user");
    }
    const DECRYPTION_AES_KEY: Buffer = this.signedInUser.userDataAESKey;
    return this.accountStorage
      .getStorageSecuredUserDataStorageConfigs({
        userId: this.signedInUser.userId,
        includeIds: "all",
        excludeIds: null,
        visibilityGroups: {
          includeIds: [null],
          excludeIds: null
        }
      })
      .map((storageSecuredDataStorageConfig: IStorageSecuredUserDataStorageConfig): ISecuredUserDataStorageConfig => {
        return storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig(storageSecuredDataStorageConfig, DECRYPTION_AES_KEY, null);
      });
  }

  private getAllDataStorageConfigsFromAccountStorageForVisibilityGroups(
    visibilityGroups: IUserDataStorageVisibilityGroup[]
  ): ISecuredUserDataStorageConfig[] {
    this.logger.info(
      `Getting all User Data Storage Configs for ${visibilityGroups.length.toString()} User Data Storage Visibility Group${
        visibilityGroups.length === 1 ? "" : "s"
      } from User Account Storage.`
    );
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.signedInUser === null) {
      throw new Error("Null signed in user");
    }
    // Get all of them with a single call to minimize storage access
    const STORAGE_SECURED_DATA_STORAGE_CONFIGS: IStorageSecuredUserDataStorageConfig[] = this.accountStorage.getStorageSecuredUserDataStorageConfigs({
      userId: this.signedInUser.userId,
      includeIds: "all",
      excludeIds: null,
      visibilityGroups: {
        includeIds: visibilityGroups.map((visibilityGroup: IUserDataStorageVisibilityGroup): UUID => {
          return visibilityGroup.visibilityGroupId;
        }),
        excludeIds: null
      }
    });
    this.logger.info(`Got ${STORAGE_SECURED_DATA_STORAGE_CONFIGS.length.toString()} STORAGE SECURED DATA STORAGE CONFIGS!`);
    const SECURED_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = [];
    for (let i = visibilityGroups.length - 1; i >= 0; i--) {
      const VISIBILITY_GROUP: IUserDataStorageVisibilityGroup = visibilityGroups[i];
      for (let j = STORAGE_SECURED_DATA_STORAGE_CONFIGS.length - 1; j >= 0; j--) {
        const STORAGE_SECURED_USER_DATA_STORAGE_CONFIG: IStorageSecuredUserDataStorageConfig = STORAGE_SECURED_DATA_STORAGE_CONFIGS[j];
        if (VISIBILITY_GROUP.visibilityGroupId === STORAGE_SECURED_USER_DATA_STORAGE_CONFIG.visibilityGroupId) {
          SECURED_DATA_STORAGE_CONFIGS.push(
            storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig(STORAGE_SECURED_USER_DATA_STORAGE_CONFIG, VISIBILITY_GROUP.AESKey, null)
          );
        }
        // STORAGE_SECURED_DATA_STORAGE_CONFIGS.splice(j, 1); <-- BUG
      }
    }
    // if (STORAGE_SECURED_DATA_STORAGE_CONFIGS.length > 0) {
    //   throw new Error(
    //     `${STORAGE_SECURED_DATA_STORAGE_CONFIGS.length.toString()} Secured User Data Storage Configs had no User Data Storage Visibility Group`
    //   );
    // }
    this.logger.info(`Got ${SECURED_DATA_STORAGE_CONFIGS.length.toString()} SECURED DATA STORAGE CONFIGS!`);
    return SECURED_DATA_STORAGE_CONFIGS;
  }
}
