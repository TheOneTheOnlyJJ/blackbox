import { LogFunctions } from "electron-log";
import { UserControllerContext } from "../UserControllerContext";
import { UUID } from "crypto";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { userDataStorageConfigToSecuredUserDataStorageConfig } from "@main/user/data/storage/config/utils/userDataStorageConfigToSecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/utils/securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToUserDataStorageInfo } from "@main/user/data/storage/config/utils/securedUserDataStorageConfigToUserDataStorageInfo";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import { storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig } from "@main/user/data/storage/config/utils/storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/SecuredUserDataStorageVisibilityGroupConfig";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";

export class UserDataStorageConfigService {
  private logger: LogFunctions;
  private readonly CONTEXT: UserControllerContext;

  public constructor(logger: LogFunctions, userControllerContext: UserControllerContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Storage Config Service.");
    this.CONTEXT = userControllerContext;
  }

  public generateRandomDataStorageId(): UUID {
    this.logger.debug("Generating random User Data Storage ID.");
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.CONTEXT.accountStorage.value.generateRandomUserDataStorageId();
  }

  public addUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): boolean {
    this.logger.debug(`Adding User Data Storage Config to user: "${userDataStorageConfig.userId}".`);
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.CONTEXT.signedInUser.value === null) {
      throw new Error("Cannot encrypt Secured User Data Storage Config with no signed in user");
    }
    if (this.CONTEXT.signedInUser.value.userId !== userDataStorageConfig.userId) {
      throw new Error(
        `Config user ID "${userDataStorageConfig.userId}" does not match signed in user ID "${this.CONTEXT.signedInUser.value.userId}"`
      );
    }
    if (this.CONTEXT.accountStorage.value.isUserIdAvailable(userDataStorageConfig.userId)) {
      throw new Error(`Cannot add User Data Storage Config to user "${userDataStorageConfig.userId}" because it does not exist`);
    }
    const SECURED_USER_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = userDataStorageConfigToSecuredUserDataStorageConfig(
      userDataStorageConfig,
      this.logger
    );
    let encryptionAESKey: Buffer;
    if (userDataStorageConfig.visibilityGroupId === null) {
      encryptionAESKey = this.CONTEXT.signedInUser.value.userDataAESKey;
    } else {
      const VISIBILITY_GROUP_AES_KEY: Buffer | undefined = this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.get(userDataStorageConfig.visibilityGroupId);
      if (VISIBILITY_GROUP_AES_KEY === undefined) {
        throw new Error(
          `User Data Storage Visibility Group "${userDataStorageConfig.visibilityGroupId}" not open! Cannot encrypt new User Data Storage Config`
        );
      }
      encryptionAESKey = VISIBILITY_GROUP_AES_KEY;
    }
    const WAS_ADDED: boolean = this.CONTEXT.accountStorage.value.addStorageSecuredUserDataStorageConfig(
      securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig(SECURED_USER_DATA_STORAGE_CONFIG, encryptionAESKey, this.logger)
    );
    if (WAS_ADDED) {
      const VISIBILITY_GROUP_CONFIG: ISecuredUserDataStorageVisibilityGroupConfig | null =
        this.getSecuredUserDataStorageVisibilityGroupConfigForConfigId(SECURED_USER_DATA_STORAGE_CONFIG.storageId);
      const VISIBILITY_GROUP_NAME: string | null = VISIBILITY_GROUP_CONFIG === null ? null : VISIBILITY_GROUP_CONFIG.name;
      this.onAvailableDataStoragesChangedCallback?.({
        removed: [],
        added: [securedUserDataStorageConfigToUserDataStorageInfo(SECURED_USER_DATA_STORAGE_CONFIG, VISIBILITY_GROUP_NAME, this.logger)]
      } satisfies IUserDataStoragesInfoChangedDiff);
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
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.CONTEXT.signedInUser.value === null) {
      throw new Error("Cannot decrypt Storage Secured User Data Storage Configs with no signed in user");
    }
    const STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS: IStorageSecuredUserDataStorageConfig[] =
      this.CONTEXT.accountStorage.value.getStorageSecuredUserDataStorageConfigs({ ...options, userId: this.CONTEXT.signedInUser.value.userId });
    return STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS.map(
      (storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): ISecuredUserDataStorageConfig => {
        if (this.CONTEXT.signedInUser.value === null) {
          throw new Error("Cannot decrypt Storage Secured User Data Storage Configs with no signed in user");
        }
        // TODO: Make this a helper function
        let decryptionAESKey: Buffer;
        if (storageSecuredUserDataStorageConfig.visibilityGroupId === null) {
          decryptionAESKey = this.CONTEXT.signedInUser.value.userDataAESKey;
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
      const VISIBILITY_GROUP_CONFIG: ISecuredUserDataStorageVisibilityGroupConfig | null = this.getSecuredUserDataStorageVisibilityGroupForConfigId(
        securedUserDataStorageConfig.storageId
      );
      const VISIBILITY_GROUP_NAME: string | null = VISIBILITY_GROUP_CONFIG === null ? null : VISIBILITY_GROUP_CONFIG.name;
      return securedUserDataStorageConfigToUserDataStorageInfo(securedUserDataStorageConfig, VISIBILITY_GROUP_NAME, null);
    });
    // TODO: Change isOpen to true on the configs that are open
  }
}
