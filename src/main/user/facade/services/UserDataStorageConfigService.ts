import { LogFunctions } from "electron-log";
import { UUID } from "crypto";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { userDataStorageConfigToSecuredUserDataStorageConfig } from "@main/user/data/storage/config/utils/userDataStorageConfigToSecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/utils/securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig";
import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import { storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig } from "@main/user/data/storage/config/utils/storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { UserDataStorage } from "@main/user/data/storage/UserDataStorage";
import { ISignedInUser } from "@main/user/account/SignedInUser";
import { UserAccountStorage } from "@main/user/account/storage/UserAccountStorage";
import { IUserDataStorageVisibilityGroup } from "@main/user/data/storage/visibilityGroup/UserDataStorageVisibilityGroup";

export interface IUserDataStorageConfigServiceContext {
  getAccountStorage: () => UserAccountStorage | null;
  getSignedInUser: () => ISignedInUser | null;
  getAvailableDataStorages: () => UserDataStorage[];
  addAvailableDataStorages: (newDataStorages: UserDataStorage[]) => void;
  getOpenDataStorageVisibilityGroups: () => IUserDataStorageVisibilityGroup[];
}

export class UserDataStorageConfigService {
  private logger: LogFunctions;
  private readonly CONTEXT: IUserDataStorageConfigServiceContext;

  public constructor(logger: LogFunctions, context: IUserDataStorageConfigServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Storage Config Service.");
    this.CONTEXT = context;
  }

  public generateRandomDataStorageId(): UUID {
    this.logger.debug("Generating random User Data Storage ID.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    return ACCOUNT_STORAGE.generateRandomUserDataStorageId();
  }

  public addUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): boolean {
    this.logger.debug(`Adding User Data Storage Config to user: "${userDataStorageConfig.userId}".`);
    const SIGNED_IN_USER: ISignedInUser | null = this.CONTEXT.getSignedInUser();
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    if (SIGNED_IN_USER === null) {
      throw new Error("Cannot encrypt Secured User Data Storage Config with no signed in user");
    }
    if (SIGNED_IN_USER.userId !== userDataStorageConfig.userId) {
      throw new Error(`Config user ID "${userDataStorageConfig.userId}" does not match signed in user ID "${SIGNED_IN_USER.userId}"`);
    }
    if (ACCOUNT_STORAGE.isUserIdAvailable(userDataStorageConfig.userId)) {
      throw new Error(`Cannot add User Data Storage Config to user "${userDataStorageConfig.userId}" because it does not exist`);
    }
    const SECURED_USER_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = userDataStorageConfigToSecuredUserDataStorageConfig(
      userDataStorageConfig,
      this.logger
    );
    let encryptionAESKey: Buffer;
    let visibilityGroupName: string | null | undefined = undefined;
    if (userDataStorageConfig.visibilityGroupId === null) {
      encryptionAESKey = SIGNED_IN_USER.userDataAESKey;
      visibilityGroupName = null;
    } else {
      let visibilityGroupAESKey: Buffer | undefined = undefined;
      for (const OPEN_VISIBILITY_GROUP of this.CONTEXT.getOpenDataStorageVisibilityGroups()) {
        if (OPEN_VISIBILITY_GROUP.visibilityGroupId === userDataStorageConfig.visibilityGroupId) {
          visibilityGroupAESKey = OPEN_VISIBILITY_GROUP.AESKey;
          visibilityGroupName = OPEN_VISIBILITY_GROUP.name;
          break;
        }
      }
      if (visibilityGroupAESKey === undefined || visibilityGroupName === undefined) {
        throw new Error(
          `User Data Storage Visibility Group "${userDataStorageConfig.visibilityGroupId}" not open! Cannot encrypt new User Data Storage Config`
        );
      }
      encryptionAESKey = visibilityGroupAESKey;
    }
    const WAS_ADDED: boolean = ACCOUNT_STORAGE.addStorageSecuredUserDataStorageConfig(
      securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig(SECURED_USER_DATA_STORAGE_CONFIG, encryptionAESKey, this.logger)
    );
    if (WAS_ADDED) {
      this.CONTEXT.addAvailableDataStorages([
        new UserDataStorage(userDataStorageConfig, visibilityGroupName, `user-data-storage-${userDataStorageConfig.storageId}`)
      ]);
      // TODO: Check if this makes any sense
      // const VISIBILITY_GROUP_CONFIG: ISecuredUserDataStorageVisibilityGroupConfig | null =
      //   this.getSecuredUserDataStorageVisibilityGroupConfigForConfigId(SECURED_USER_DATA_STORAGE_CONFIG.storageId);
      // const VISIBILITY_GROUP_NAME: string | null = VISIBILITY_GROUP_CONFIG === null ? null : VISIBILITY_GROUP_CONFIG.name;
      // this.onAvailableDataStoragesChangedCallback?.({
      //   removed: [],
      //   added: [securedUserDataStorageConfigToUserDataStorageInfo(SECURED_USER_DATA_STORAGE_CONFIG, VISIBILITY_GROUP_NAME, this.logger)]
      // } satisfies IUserDataStoragesInfoChangedDiff);
    }
    return WAS_ADDED;
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
    const SIGNED_IN_USER: ISignedInUser | null = this.CONTEXT.getSignedInUser();
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    if (SIGNED_IN_USER === null) {
      throw new Error("Cannot decrypt Storage Secured User Data Storage Configs with no signed in user");
    }
    const STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS: IStorageSecuredUserDataStorageConfig[] = ACCOUNT_STORAGE.getStorageSecuredUserDataStorageConfigs(
      { ...options, userId: SIGNED_IN_USER.userId }
    );
    return STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS.map(
      (storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): ISecuredUserDataStorageConfig => {
        // if (SIGNED_IN_USER === null) {
        //   throw new Error("Cannot decrypt Storage Secured User Data Storage Configs with no signed in user");
        // }
        // TODO: Make this a helper function
        let decryptionAESKey: Buffer;
        if (storageSecuredUserDataStorageConfig.visibilityGroupId === null) {
          decryptionAESKey = SIGNED_IN_USER.userDataAESKey;
        } else {
          let visibilityGroupAESKey: Buffer | undefined = undefined;
          for (const OPEN_VISIBILITY_GROUP of this.CONTEXT.getOpenDataStorageVisibilityGroups()) {
            if (OPEN_VISIBILITY_GROUP.visibilityGroupId === storageSecuredUserDataStorageConfig.visibilityGroupId) {
              visibilityGroupAESKey = OPEN_VISIBILITY_GROUP.AESKey;
              break;
            }
          }
          if (visibilityGroupAESKey === undefined) {
            throw new Error(
              `User Data Storage Visibility Group "${storageSecuredUserDataStorageConfig.visibilityGroupId}" missing from open User Data Storage Visibility Groups! Cannot decrypt User Data Storage Config`
            );
          }
          decryptionAESKey = visibilityGroupAESKey;
        }
        return storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig(storageSecuredUserDataStorageConfig, decryptionAESKey, null);
      }
    );
  }

  public getAllSignedInUserAvailableDataStoragesInfo(): IUserDataStorageInfo[] {
    this.logger.debug("Getting all signed in user's available User Data Storages Info.");
    // const SECURED_USER_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = this.getSignedInUserSecuredUserDataStorageConfigs({
    //   includeIds: "all",
    //   excludeIds: null,
    //   visibilityGroups: {
    //     includeIds: [null, ...Array.from(this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.keys())],
    //     excludeIds: null
    //   }
    // });
    // return SECURED_USER_DATA_STORAGE_CONFIGS.map((securedUserDataStorageConfig: ISecuredUserDataStorageConfig): IUserDataStorageInfo => {
    //   // TODO: Make this one call for all to not destroy the network
    //   const VISIBILITY_GROUP_CONFIG: ISecuredUserDataStorageVisibilityGroupConfig | null = this.getSecuredUserDataStorageVisibilityGroupForConfigId(
    //     securedUserDataStorageConfig.storageId
    //   );
    //   const VISIBILITY_GROUP_NAME: string | null = VISIBILITY_GROUP_CONFIG === null ? null : VISIBILITY_GROUP_CONFIG.name;
    //   return securedUserDataStorageConfigToUserDataStorageInfo(securedUserDataStorageConfig, VISIBILITY_GROUP_NAME, null);
    // });
    // TODO: Change isOpen to true on the configs that are open
    return this.CONTEXT.getAvailableDataStorages().map((dataStorage: UserDataStorage): IUserDataStorageInfo => {
      return dataStorage.getInfo();
    });
  }
}
