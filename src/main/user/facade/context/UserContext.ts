import { LogFunctions } from "electron-log";
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
import { UserAuthContext } from "./subcontexts/UserAuthContext";
import { UserAccountStorageContext } from "./subcontexts/UserAccountStorageContext";
import { AvailableUserDataStorageConfigsContext } from "./subcontexts/AvailableUserDataStorageConfigsContext";
import { OpenUserDataStorageVisibilityGroupsContext } from "./subcontexts/OpenUserDataStorageVisibilityGroupsContext";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { InitialisedUserDataStoragesContext } from "./subcontexts/InitialisedUserDataStoragesContext";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { UserDataStorage } from "@main/user/data/storage/UserDataStorage";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { userDataStorageConfigToUserDataStorageConfigInfo } from "@main/user/data/storage/config/utils/userDataStorageConfigToUserDataStorageConfigInfo";
import { AvailableUserDataBoxesContext } from "./subcontexts/AvailableUserDataBoxesContext";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { ISecuredUserDataBoxConfig } from "@main/user/data/box/config/SecuredUserDataBoxConfig";
import { IUserDataBox } from "@main/user/data/box/UserDataBox";
import { securedUserDataBoxConfigToUserDataBox } from "@main/user/data/box/config/utils/securedUserDataBoxConfigToUserDataBox";
import { IStorageSecuredUserDataBoxConfig } from "@main/user/data/box/config/StorageSecuredUserDataBoxConfig";
import { storageSecuredUserDataBoxConfigToSecuredUserDataBoxConfig } from "@main/user/data/box/config/utils/storageSecuredUserDataBoxConfigToSecuredUserDataBoxConfig";

export interface IUserContextLoggers {
  main: LogFunctions;
  subcontexts: {
    accountStorage: LogFunctions;
    auth: LogFunctions;
    availableDataStorageConfigs: LogFunctions;
    openDataStorageVisibilityGroups: LogFunctions;
    initialisedDataStorages: LogFunctions;
    availableDataBoxes: LogFunctions;
  };
}

export interface IUserContextHandlers {
  onSignedInUserChangedCallback: ((newSignedInUserInfo: ISignedInUserInfo | null) => void) | null;
  onUserAccountStorageChangedCallback: ((newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void) | null;
  onAvailableSecuredUserDataStorageConfigsChangedCallback:
    | ((availableUserDataStorageConfigsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageConfigInfo>) => void)
    | null;
  onAvailableSecuredUserDataStorageConfigInfoChangedCallback: ((newUserDataStorageCnfigInfo: Readonly<IUserDataStorageConfigInfo>) => void) | null;
  onOpenUserDataStorageVisibilityGroupsChangedCallback:
    | ((dataStorageVisibilityGroupsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>) => void)
    | null;
  onInitialisedUserDataStoragesChangedCallback:
    | ((availableUserDataStoragesInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageInfo>) => void)
    | null;
  onInitialisedUserDataStorageInfoChangedCallback: ((userDataStorageInfo: Readonly<IUserDataStorageInfo>) => void) | null;
  onAvailableUserDataBoxesChanged: ((availableDataBoxesChangedDiff: IDataChangedDiff<UUID, IUserDataBoxInfo>) => void) | null;
}

export class UserContext {
  private readonly logger: LogFunctions;
  private readonly HANDLERS: IUserContextHandlers;

  public readonly ACCOUNT_STORAGE_CONTEXT: UserAccountStorageContext;
  public readonly AUTH_CONTEXT: UserAuthContext;
  public readonly AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT: AvailableUserDataStorageConfigsContext;
  public readonly INITIALISED_DATA_STORAGES_CONTEXT: InitialisedUserDataStoragesContext;
  public readonly OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT: OpenUserDataStorageVisibilityGroupsContext;
  public readonly AVAILABLE_DATA_BOXES_CONTEXT: AvailableUserDataBoxesContext;

  public constructor(loggers: IUserContextLoggers, contextHandlers: IUserContextHandlers) {
    this.logger = loggers.main;
    this.logger.info("Initialising new User Context.");
    this.HANDLERS = contextHandlers;
    // Initialise contexts
    this.ACCOUNT_STORAGE_CONTEXT = new UserAccountStorageContext(loggers.subcontexts.accountStorage);
    this.AUTH_CONTEXT = new UserAuthContext(loggers.subcontexts.auth);
    this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT = new AvailableUserDataStorageConfigsContext(loggers.subcontexts.availableDataStorageConfigs);
    this.INITIALISED_DATA_STORAGES_CONTEXT = new InitialisedUserDataStoragesContext(loggers.subcontexts.initialisedDataStorages);
    this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT = new OpenUserDataStorageVisibilityGroupsContext(
      loggers.subcontexts.openDataStorageVisibilityGroups
    );
    this.AVAILABLE_DATA_BOXES_CONTEXT = new AvailableUserDataBoxesContext(loggers.subcontexts.availableDataBoxes);
    // Wire up context interdependencies
    this.wireAllContextHandlers();
  }

  private wireAllContextHandlers(): void {
    this.logger.info("Wiring all User Context subcontext handlers.");
    this.wireUserAccountStorageContextHandlers();
    this.wireUserAuthContextHandlers();
    this.wireAvailableUserDataStorageConfigsContextHandlers();
    this.wireInitialisedUserDataStoragesContextHandlers();
    this.wireOpenUserDataStorageVisibilityGroupsContextHandlers();
    this.wireAvailableUserDataBoxesContextHandlers();
  }

  private wireUserAccountStorageContextHandlers(): void {
    this.logger.info("Wiring User Account Storage Context handlers.");
    this.ACCOUNT_STORAGE_CONTEXT.onAddedNewUserDataStorageConfigsCallback = (
      newSecuredUserDataStorageConfigs: ISecuredUserDataStorageConfig[]
    ): void => {
      if (newSecuredUserDataStorageConfigs.length > 0) {
        this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.addAvailableSecuredDataStorageConfigs(newSecuredUserDataStorageConfigs);
      }
    };
    this.ACCOUNT_STORAGE_CONTEXT.onUserAccountStorageChangedCallback = (newUserAccountStorage: UserAccountStorage | null): void => {
      // TODO: What is this? Add onInfoChanged alongside it?
      this.HANDLERS.onUserAccountStorageChangedCallback?.(newUserAccountStorage !== null ? newUserAccountStorage.getInfo() : null);
    };
  }

  private wireUserAuthContextHandlers(): void {
    this.logger.info("Wiring User Auth Context handlers.");
    this.AUTH_CONTEXT.beforeSignOutCallback = (): void => {
      this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.clearAllAvailableSecuredDataStorageConfigs();
      this.INITIALISED_DATA_STORAGES_CONTEXT.terminateAllInitialisedDataStorages();
      this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT.clearAllOpenDataStorageVisibilityGroups();
    };
    this.AUTH_CONTEXT.onSignedInUserChangedCallback = (newSignedInUser: ISignedInUser | null): void => {
      this.HANDLERS.onSignedInUserChangedCallback?.(newSignedInUser !== null ? signedInUserToSignedInUserInfo(newSignedInUser, this.logger) : null);
    };
    this.AUTH_CONTEXT.onNewSignedInUserCallback = (): void => {
      const ALL_PUBLIC_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = this.getAllPublicDataStorageConfigsFromAccountStorage();
      if (ALL_PUBLIC_DATA_STORAGE_CONFIGS.length > 0) {
        this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.addAvailableSecuredDataStorageConfigs(ALL_PUBLIC_DATA_STORAGE_CONFIGS);
      }
    };
  }

  private wireAvailableUserDataStorageConfigsContextHandlers(): void {
    this.logger.info("Wiring Available User Data Storage Configs Context handlers.");
    this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.onAvailableSecuredUserDataStorageConfigsChangedCallback = (
      availableSecuredDataStorageConfigsChangedDiff: IDataChangedDiff<UUID, ISecuredUserDataStorageConfig>
    ): void => {
      if (availableSecuredDataStorageConfigsChangedDiff.removed.length > 0 || availableSecuredDataStorageConfigsChangedDiff.added.length > 0) {
        this.HANDLERS.onAvailableSecuredUserDataStorageConfigsChangedCallback?.({
          removed: availableSecuredDataStorageConfigsChangedDiff.removed,
          added: availableSecuredDataStorageConfigsChangedDiff.added.map(
            (newSecuredDataStorageConfig: ISecuredUserDataStorageConfig): IUserDataStorageConfigInfo => {
              return securedUserDataStorageConfigToUserDataStorageConfigInfo(
                newSecuredDataStorageConfig,
                this.INITIALISED_DATA_STORAGES_CONTEXT.isDataStorageInitialised(newSecuredDataStorageConfig.storageId, false),
                null
              );
            }
          )
        } satisfies IDataChangedDiff<string, IUserDataStorageConfigInfo>);
      }
    };
  }

  private wireInitialisedUserDataStoragesContextHandlers(): void {
    this.logger.info("Wiring Initialised User Data Storages Context handlers.");
    this.INITIALISED_DATA_STORAGES_CONTEXT.onInitialisedUserDataStoragesChangedCallback = (
      initialisedDataStoragesChangedDiff: IDataChangedDiff<IUserDataStorageConfig, UserDataStorage>
    ): void => {
      // TODO: Remove this?
      // if (initialisedDataStoragesChangedDiff.removed.length > 0) {
      //   // When visibility groups close, the configs are removed their context's onChange callback, even though here they get added back regardless
      //   this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.addAvailableSecuredDataStorageConfigs(initialisedDataStoragesChangedDiff.removed);
      // }
      // if (initialisedDataStoragesChangedDiff.added.length > 0) {
      //   this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.removeAvailableSecuredDataStorageConfigs(
      //     initialisedDataStoragesChangedDiff.added.map((userDataStorage: UserDataStorage): UUID => {
      //       return userDataStorage.storageId;
      //     })
      //   );
      // }
      if (initialisedDataStoragesChangedDiff.removed.length > 0) {
        initialisedDataStoragesChangedDiff.removed.map((removedUserDataStorageConfig: IUserDataStorageConfig): void => {
          this.HANDLERS.onAvailableSecuredUserDataStorageConfigInfoChangedCallback?.(
            userDataStorageConfigToUserDataStorageConfigInfo(removedUserDataStorageConfig, false, null)
          );
        });
      }
      if (initialisedDataStoragesChangedDiff.added.length > 0) {
        initialisedDataStoragesChangedDiff.added.map((userDataStorage: UserDataStorage): void => {
          this.HANDLERS.onAvailableSecuredUserDataStorageConfigInfoChangedCallback?.(
            userDataStorageConfigToUserDataStorageConfigInfo(userDataStorage.getConfig(), true, null)
          );
        });
      }
      if (initialisedDataStoragesChangedDiff.removed.length > 0 || initialisedDataStoragesChangedDiff.added.length > 0) {
        this.HANDLERS.onInitialisedUserDataStoragesChangedCallback?.({
          removed: initialisedDataStoragesChangedDiff.removed.map((removedUserDataStorageConfig: IUserDataStorageConfig): UUID => {
            return removedUserDataStorageConfig.storageId;
          }),
          added: initialisedDataStoragesChangedDiff.added.map((userDataStorage: UserDataStorage): IUserDataStorageInfo => {
            return userDataStorage.getInfo();
          })
        } satisfies IDataChangedDiff<string, IUserDataStorageInfo>);
      }
    };
    this.INITIALISED_DATA_STORAGES_CONTEXT.onInitialisedUserDataStorageInfoChangedCallback = (
      userDataStorageInfo: Readonly<IUserDataStorageInfo>
    ): void => {
      this.HANDLERS.onInitialisedUserDataStorageInfoChangedCallback?.(userDataStorageInfo);
    };
    this.INITIALISED_DATA_STORAGES_CONTEXT.onAddedNewSecuredUserDataBoxConfigsCallback = (
      newSecuredUserDataBoxConfigs: ISecuredUserDataBoxConfig[]
    ): void => {
      if (newSecuredUserDataBoxConfigs.length > 0) {
        this.AVAILABLE_DATA_BOXES_CONTEXT.addAvailableDataBoxes(
          newSecuredUserDataBoxConfigs.map((newSecuredUserDataBoxConfig: ISecuredUserDataBoxConfig): IUserDataBox => {
            return securedUserDataBoxConfigToUserDataBox(newSecuredUserDataBoxConfig, null);
          })
        );
      }
    };
    this.INITIALISED_DATA_STORAGES_CONTEXT.onOpenedInitialisedDataStorages = (openedDataStoragesInfo: IUserDataStorageInfo[]): void => {
      openedDataStoragesInfo.map((openedDataStorageInfo: IUserDataStorageInfo): void => {
        this.AVAILABLE_DATA_BOXES_CONTEXT.addAvailableDataBoxes(this.getAllDataBoxConfigsFromDataStorage(openedDataStorageInfo.storageId as UUID));
      });
    };
    this.INITIALISED_DATA_STORAGES_CONTEXT.onClosedInitialisedDataStorages = (closedDataStoragesInfo: IUserDataStorageInfo[]): void => {
      closedDataStoragesInfo.map((closedDataStorageInfo: IUserDataStorageInfo): void => {
        this.AVAILABLE_DATA_BOXES_CONTEXT.removeAvailableDataBoxes(
          this.AVAILABLE_DATA_BOXES_CONTEXT.getAvailableDataBoxes()
            .filter((availableDataBox: IUserDataBox): boolean => {
              return availableDataBox.storageId === closedDataStorageInfo.storageId;
            })
            .map((availableDataBoxToBeRemoved: IUserDataBox): UUID => {
              return availableDataBoxToBeRemoved.boxId;
            })
        );
      });
    };
  }

  private wireOpenUserDataStorageVisibilityGroupsContextHandlers(): void {
    this.logger.info("Wiring Open User Data Storage Visibility Groups Context handlers.");
    this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT.onOpenUserDataStorageVisibilityGroupsChangedCallback = (
      openDataStorageVisibilityGroupsChangedDiff: IDataChangedDiff<UUID, IUserDataStorageVisibilityGroup>
    ): void => {
      if (openDataStorageVisibilityGroupsChangedDiff.removed.length > 0) {
        // Initialised data storages
        const INITIALISED_DATA_STORAGE_IDS_TO_BE_TERMINATED: UUID[] =
          this.INITIALISED_DATA_STORAGES_CONTEXT.getAllInitialisedDataStorageIdsForVisibilityGroupIds(
            openDataStorageVisibilityGroupsChangedDiff.removed
          );
        if (INITIALISED_DATA_STORAGE_IDS_TO_BE_TERMINATED.length > 0) {
          this.INITIALISED_DATA_STORAGES_CONTEXT.terminateDataStoragesFromIds(INITIALISED_DATA_STORAGE_IDS_TO_BE_TERMINATED);
        }
        // Available data storage configs
        const SECURED_DATA_STORAGE_CONFIG_IDS_TO_BE_REMOVED: UUID[] =
          this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.getAllAvailableDataStorageConfigIdsForVisibilityGroupIds(
            openDataStorageVisibilityGroupsChangedDiff.removed
          );
        if (SECURED_DATA_STORAGE_CONFIG_IDS_TO_BE_REMOVED.length > 0) {
          this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.removeAvailableSecuredDataStorageConfigs(SECURED_DATA_STORAGE_CONFIG_IDS_TO_BE_REMOVED);
        }
      }
      if (openDataStorageVisibilityGroupsChangedDiff.added.length > 0) {
        const DATA_STORAGE_CONFIGS_TO_BE_ADDED: ISecuredUserDataStorageConfig[] = this.getAllDataStorageConfigsFromAccountStorageForVisibilityGroups(
          openDataStorageVisibilityGroupsChangedDiff.added
        );
        if (DATA_STORAGE_CONFIGS_TO_BE_ADDED.length > 0) {
          this.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.addAvailableSecuredDataStorageConfigs(DATA_STORAGE_CONFIGS_TO_BE_ADDED);
        }
      }
      if (openDataStorageVisibilityGroupsChangedDiff.removed.length > 0 || openDataStorageVisibilityGroupsChangedDiff.added.length > 0) {
        this.HANDLERS.onOpenUserDataStorageVisibilityGroupsChangedCallback?.({
          removed: openDataStorageVisibilityGroupsChangedDiff.removed,
          added: openDataStorageVisibilityGroupsChangedDiff.added.map(
            (newVisibilityGroup: IUserDataStorageVisibilityGroup): IUserDataStorageVisibilityGroupInfo => {
              return userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(newVisibilityGroup, null);
            }
          )
        } satisfies IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>);
      }
    };
  }

  private wireAvailableUserDataBoxesContextHandlers(): void {
    this.logger.info("Wiring Open User Data Boxes Context handlers.");
    this.AVAILABLE_DATA_BOXES_CONTEXT.onAvailableDataBoxesChangedCallback = (
      availableDataBoxesChangedDiff: IDataChangedDiff<UUID, IUserDataBoxInfo>
    ): void => {
      if (availableDataBoxesChangedDiff.removed.length > 0 || availableDataBoxesChangedDiff.added.length > 0) {
        this.HANDLERS.onAvailableUserDataBoxesChanged?.({
          removed: availableDataBoxesChangedDiff.removed,
          added: availableDataBoxesChangedDiff.added
        } satisfies IDataChangedDiff<UUID, IUserDataBoxInfo>);
      }
    };
  }

  private getAllPublicDataStorageConfigsFromAccountStorage(): ISecuredUserDataStorageConfig[] {
    // TODO: When getting configs, take into account currently available data storages to exclude them
    this.logger.info("Getting all public User Data Storage Configs from User Account Storage.");
    if (!this.ACCOUNT_STORAGE_CONTEXT.isSet()) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: ISignedInUser | null = this.AUTH_CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Null signed in user");
    }
    return this.ACCOUNT_STORAGE_CONTEXT.getStorageSecuredUserDataStorageConfigs({
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
    if (!this.ACCOUNT_STORAGE_CONTEXT.isSet()) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: ISignedInUser | null = this.AUTH_CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Null signed in user");
    }
    // Get all of them with a single call to minimize storage access
    const STORAGE_SECURED_DATA_STORAGE_CONFIGS: IStorageSecuredUserDataStorageConfig[] =
      this.ACCOUNT_STORAGE_CONTEXT.getStorageSecuredUserDataStorageConfigs({
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
      }
    }
    return SECURED_DATA_STORAGE_CONFIGS;
  }

  private getAllDataBoxConfigsFromDataStorage(dataStorageId: UUID): IUserDataBox[] {
    this.logger.info(`Getting all User Data Box Configs from User Data Storage "${dataStorageId}".`);
    const SIGNED_IN_USER: ISignedInUser | null = this.AUTH_CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Null signed in user");
    }
    return this.INITIALISED_DATA_STORAGES_CONTEXT.getStorageSecuredUserDataBoxConfigsForUserDataStorage(dataStorageId).map(
      (storageSecuredDataBoxConfig: IStorageSecuredUserDataBoxConfig): IUserDataBox => {
        return securedUserDataBoxConfigToUserDataBox(
          storageSecuredUserDataBoxConfigToSecuredUserDataBoxConfig(storageSecuredDataBoxConfig, SIGNED_IN_USER.userDataAESKey, null),
          null
        );
      }
    );
  }
}
