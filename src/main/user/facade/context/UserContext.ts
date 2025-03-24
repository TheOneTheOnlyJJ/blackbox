import log, { LogFunctions } from "electron-log";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { UUID } from "node:crypto";
import { ISignedInUser } from "../../account/SignedInUser";
import { signedInUserToSignedInUserInfo } from "../../account/utils/signedInUserToSignedInUserInfo";
import { UserAccountStorage } from "../../account/storage/UserAccountStorage";
import { IUserDataStorageVisibilityGroup } from "../../data/storage/visibilityGroup/UserDataStorageVisibilityGroup";

import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo } from "../../data/storage/visibilityGroup/utils/userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo";
import { IStorageSecuredUserDataStorageConfig } from "../../data/storage/config/StorageSecuredUserDataStorageConfig";
import { storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig } from "../../data/storage/config/utils/storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig";
import { ISecuredUserDataStorageConfig } from "../../data/storage/config/SecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToUserDataStorageConfigInfo } from "@main/user/data/storage/config/utils/securedUserDataStorageConfigToUserDataStorageConfigInfo";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { UserAuthenticationContext } from "./subcontexts/UserAuthenticationContext";
import { UserAccountStorageContext } from "./subcontexts/UserAccountStorageContext";
import { UserAvailableUserDataStorageConfigsContext } from "./subcontexts/UserAvailableUserDataStorageConfigsContext";
import { UserOpenUserDataStorageVisibilityGroupsContext } from "./subcontexts/UserOpenUserDataStorageVisibilityGroupsContext";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";

export interface IUserContextHandlers {
  onSignedInUserChangedCallback: ((newSignedInUserInfo: ISignedInUserInfo | null) => void) | null;
  onUserAccountStorageChangedCallback: ((newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void) | null;
  onAvailableUserDataStorageConfigsChangedCallback:
    | ((availableUserDataStorageConfigsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageConfigInfo>) => void)
    | null;
  onOpenUserDataStorageVisibilityGroupsChangedCallback:
    | ((dataStorageVisibilityGroupsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>) => void)
    | null;
}

export class UserContext {
  private readonly logger: LogFunctions;
  private readonly HANDLERS: IUserContextHandlers;

  public readonly ACCOUNT_STORAGE_CONTEXT: UserAccountStorageContext;
  public readonly AUTH_CONTEXT: UserAuthenticationContext;
  public readonly AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT: UserAvailableUserDataStorageConfigsContext;
  public readonly OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT: UserOpenUserDataStorageVisibilityGroupsContext;

  public constructor(logger: LogFunctions, contextHandlers: IUserContextHandlers) {
    this.logger = logger;
    this.logger.info("Initialising new User Context.");
    this.HANDLERS = contextHandlers;
    // Initialise contexts
    // TODO: Make loggers come from above?
    this.ACCOUNT_STORAGE_CONTEXT = new UserAccountStorageContext(log.scope("main-user-account-storage-context"));
    this.AUTH_CONTEXT = new UserAuthenticationContext(log.scope("main-user-auth-context"));
    this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT = new UserAvailableUserDataStorageConfigsContext(
      log.scope("main-user-available-data-storage-configs-context")
    );
    this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT = new UserOpenUserDataStorageVisibilityGroupsContext(
      log.scope("main-user-open-data-storage-visibility-groups-context")
    );
    // Wire up context interdependencies
    this.wireAllContextHandlers();
  }

  private wireAllContextHandlers(): void {
    this.logger.info("Wiring all User Context subcontext handlers.");
    this.wireUserAccountStorageContextHandlers();
    this.wireUserAuthenticationContextHandlers();
    this.wireUserAvailableUserDataStorageConfigsContextHandlers();
    this.wireUserOpenUserDataStorageVisibilityGroupsContextHandlers();
  }

  private wireUserAccountStorageContextHandlers(): void {
    this.logger.info("Wiring User Account Storage Context handlers.");
    this.ACCOUNT_STORAGE_CONTEXT.onAddedNewUserDataStorageConfigsCallback = (
      newSecuredUserDataStorageConfigs: ISecuredUserDataStorageConfig[]
    ): void => {
      if (newSecuredUserDataStorageConfigs.length > 0) {
        this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.addAvailableDataStorageConfigs(newSecuredUserDataStorageConfigs);
      }
    };
    this.ACCOUNT_STORAGE_CONTEXT.onUserAccountStorageChangedCallback = (newUserAccountStorage: UserAccountStorage | null): void => {
      this.HANDLERS.onUserAccountStorageChangedCallback?.(newUserAccountStorage !== null ? newUserAccountStorage.getInfo() : null);
    };
  }

  private wireUserAuthenticationContextHandlers(): void {
    this.logger.info("Wiring User Authentication Context handlers.");
    this.AUTH_CONTEXT.beforeSignOutCallback = (): void => {
      this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.clearAvailableDataStorageConfigs();
      this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT.clearOpenDataStorageVisibilityGroups();
    };
    this.AUTH_CONTEXT.onSignedInUserChangedCallback = (newSignedInUser: ISignedInUser | null): void => {
      this.HANDLERS.onSignedInUserChangedCallback?.(newSignedInUser !== null ? signedInUserToSignedInUserInfo(newSignedInUser, this.logger) : null);
    };
    this.AUTH_CONTEXT.onNewSignedInUserCallback = (): void => {
      const ALL_PUBLIC_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = this.getAllPublicDataStorageConfigsFromAccountStorage();
      if (ALL_PUBLIC_DATA_STORAGE_CONFIGS.length > 0) {
        this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.addAvailableDataStorageConfigs(ALL_PUBLIC_DATA_STORAGE_CONFIGS);
      }
    };
  }

  private wireUserAvailableUserDataStorageConfigsContextHandlers(): void {
    this.logger.info("Wiring User Available User Data Storage Configs Context handlers.");
    this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.onAvailableUserDataStorageConfigsChangedCallback = (
      availableDataStorageConfigsChangedDiff: IDataChangedDiff<UUID, IUserDataStorageConfig>
    ): void => {
      this.HANDLERS.onAvailableUserDataStorageConfigsChangedCallback?.({
        removed: availableDataStorageConfigsChangedDiff.removed,
        added: availableDataStorageConfigsChangedDiff.added.map((newDataStorageConfig: ISecuredUserDataStorageConfig): IUserDataStorageConfigInfo => {
          return securedUserDataStorageConfigToUserDataStorageConfigInfo(newDataStorageConfig, null);
        })
      } satisfies IDataChangedDiff<string, IUserDataStorageConfigInfo>);
    };
  }

  private wireUserOpenUserDataStorageVisibilityGroupsContextHandlers(): void {
    this.logger.info("Wiring User Open User Data Storage Visibility Groups Context handlers.");
    this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT.onOpenUserDataStorageVisibilityGroupsChangedCallback = (
      openDataStorageVisibilityGroupsChangedDiff: IDataChangedDiff<UUID, IUserDataStorageVisibilityGroup>
    ): void => {
      if (openDataStorageVisibilityGroupsChangedDiff.removed.length > 0) {
        const DATA_STORAGE_CONFIG_IDS_TO_BE_REMOVED: UUID[] = this.getAllDataStorageConfigIdsForVisibilityGroupIds(
          openDataStorageVisibilityGroupsChangedDiff.removed
        );
        if (DATA_STORAGE_CONFIG_IDS_TO_BE_REMOVED.length > 0) {
          this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.removeAvailableDataStorageConfigs(DATA_STORAGE_CONFIG_IDS_TO_BE_REMOVED);
        }
      }
      if (openDataStorageVisibilityGroupsChangedDiff.added.length > 0) {
        const DATA_STORAGE_CONFIGS_TO_BE_ADDED: ISecuredUserDataStorageConfig[] = this.getAllDataStorageConfigsFromAccountStorageForVisibilityGroups(
          openDataStorageVisibilityGroupsChangedDiff.added
        );
        if (DATA_STORAGE_CONFIGS_TO_BE_ADDED.length > 0) {
          this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.addAvailableDataStorageConfigs(DATA_STORAGE_CONFIGS_TO_BE_ADDED);
        }
      }
      this.HANDLERS.onOpenUserDataStorageVisibilityGroupsChangedCallback?.({
        removed: openDataStorageVisibilityGroupsChangedDiff.removed,
        added: openDataStorageVisibilityGroupsChangedDiff.added.map(
          (newVisibilityGroup: IUserDataStorageVisibilityGroup): IUserDataStorageVisibilityGroupInfo => {
            return userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(newVisibilityGroup, null);
          }
        )
      } satisfies IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>);
    };
  }

  private getAllDataStorageConfigIdsForVisibilityGroupIds(visibilityGroupIds: UUID[]): UUID[] {
    this.logger.info(
      `Getting all available User Data Storage IDs for ${visibilityGroupIds.length.toString()} User Data Storage Visibility Group ID${
        visibilityGroupIds.length === 1 ? "" : "s"
      }.`
    );
    const AVAILABLE_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] =
      this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.getAvailableDataStorageConfigs();
    const DATA_STORAGE_IDS: UUID[] = [];
    for (const VISIBILITY_GROUP_ID of visibilityGroupIds) {
      for (const AVAILABLE_DATA_STORAGE of AVAILABLE_DATA_STORAGE_CONFIGS) {
        if (VISIBILITY_GROUP_ID === AVAILABLE_DATA_STORAGE.visibilityGroupId) {
          DATA_STORAGE_IDS.push(AVAILABLE_DATA_STORAGE.storageId);
        }
      }
    }
    return DATA_STORAGE_IDS;
  }

  private getAllPublicDataStorageConfigsFromAccountStorage(): ISecuredUserDataStorageConfig[] {
    this.logger.info("Getting all public User Data Storage Configs from User Account Storage.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.ACCOUNT_STORAGE_CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: ISignedInUser | null = this.AUTH_CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Null signed in user");
    }
    return ACCOUNT_STORAGE.getStorageSecuredUserDataStorageConfigs({
      userId: SIGNED_IN_USER.userId,
      includeIds: "all",
      excludeIds: null,
      visibilityGroups: {
        includeIds: [null],
        excludeIds: null
      }
    }).map((storageSecuredDataStorageConfig: IStorageSecuredUserDataStorageConfig): ISecuredUserDataStorageConfig => {
      return storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig(storageSecuredDataStorageConfig, SIGNED_IN_USER.userDataAESKey, null);
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
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.ACCOUNT_STORAGE_CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: ISignedInUser | null = this.AUTH_CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Null signed in user");
    }
    // Get all of them with a single call to minimize storage access
    const STORAGE_SECURED_DATA_STORAGE_CONFIGS: IStorageSecuredUserDataStorageConfig[] = ACCOUNT_STORAGE.getStorageSecuredUserDataStorageConfigs({
      userId: SIGNED_IN_USER.userId,
      includeIds: "all",
      excludeIds: null,
      visibilityGroups: {
        includeIds: visibilityGroups.map((visibilityGroup: IUserDataStorageVisibilityGroup): UUID => {
          return visibilityGroup.visibilityGroupId;
        }),
        excludeIds: null
      }
    });
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
    return SECURED_DATA_STORAGE_CONFIGS;
  }
}
