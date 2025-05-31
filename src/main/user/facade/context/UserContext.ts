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
import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import { userDataBoxToUserDataBoxIdentifier } from "@main/user/data/box/utils/userDataBoxToUserDataBoxIdentifier";
import { AvailableUserDataTemplatesContext } from "./subcontexts/AvailableUserDataTemplatesContext";
import { IUserDataTemplate } from "@main/user/data/template/UserDataTemplate";
import { userDataBoxToUserDataBoxInfo } from "@main/user/data/box/utils/userDataBoxToUserDataBoxInfo";
import { userDataTemplateToUserDataTemplateInfo } from "@main/user/data/template/utils/userDataTemplateToUserDataTemplateInfo";
import { IStorageSecuredUserDataTemplateConfig } from "@main/user/data/template/config/StorageSecuredUserDataTemplateConfig";
import { storageSecuredUserDataTemplateConfigToSecuredUserDataTemplateConfig } from "@main/user/data/template/config/utils/storageSecuredUserDataTemplateConfigToSecuredUserDataTemplateConfig";
import { securedUserDataTemplateConfigToUserDataTemplate } from "@main/user/data/template/config/utils/securedUserDataTemplateConfigToUserDataTemplate";
import {
  IUserDataStorageUserDataBoxConfigFilter,
  IUserDataStorageUserDataEntryFilter,
  IUserDataStorageUserDataTemplateConfigFilter
} from "@main/user/data/storage/backend/BaseUserDataStorageBackend";
import { ISecuredUserDataTemplateConfig } from "@main/user/data/template/config/SecuredUserDataTemplateConfig";
import { AvailableUserDataEntriesContext } from "./subcontexts/AvailableUserDataEntriesContext";
import { IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { IUserDataEntry } from "@main/user/data/entry/UserDataEntry";
import { IUserDataEntryInfo } from "@shared/user/data/entry/info/UserDataEntryInfo";
import { userDataEntryToUserDataEntryInfo } from "@main/user/data/entry/utils/userDataEntryToUserDataEntryInfo";
import { IStorageSecuredUserDataEntry } from "@main/user/data/entry/StorageSecuredUserDataEntry";
import { storageSecuredUserDataEntryToUserDataEntry } from "@main/user/data/entry/utils/storageSecuredUserDataEntryToUserDataEntry";
import { isUserDataTemplateIdentifierMatchingUserDataTemplate } from "@main/user/data/template/utils/isUserDataTemplateIdentifierMatchingUserDataTemplate";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { getUserDataEntryJSONSchemaFromTemplateInfo } from "@main/user/data/entry/utils/getUserDataEntryJSONSchemaFromTemplateInfo";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { userDataEntryToUserDataEntryIdentifier } from "@main/user/data/entry/utils/userDataEntryToUserDataEntryIdentifier";
import { isUserDataEntryIdentifierMatchingUserDataEntry } from "@main/user/data/entry/utils/isUserDataEntryIdentifierMatchingUserDataEntry";

export interface IUserContextLoggers {
  main: LogFunctions;
  subcontexts: {
    accountStorage: LogFunctions;
    auth: LogFunctions;
    availableDataStorageConfigs: LogFunctions;
    openDataStorageVisibilityGroups: LogFunctions;
    initialisedDataStorages: LogFunctions;
    availableDataBoxes: LogFunctions;
    availableDataTemplates: LogFunctions;
    availableDataEntries: LogFunctions;
  };
}

export interface IUserContextHandlers {
  onSignedInUserChangedCallback: ((newSignedInUserInfo: ISignedInUserInfo | null) => void) | null;
  onUserAccountStorageChangedCallback: ((newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void) | null;
  onAvailableSecuredUserDataStorageConfigsChangedCallback:
    | ((availableUserDataStorageConfigsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageConfigInfo>) => void)
    | null;
  onAvailableSecuredUserDataStorageConfigInfoChangedCallback: ((newUserDataStorageCnfigInfo: Readonly<IUserDataStorageConfigInfo>) => void) | null;
  // TODO: This should use a proper identifier?
  onOpenUserDataStorageVisibilityGroupsChangedCallback:
    | ((dataStorageVisibilityGroupsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>) => void)
    | null;
  onInitialisedUserDataStoragesChangedCallback:
    | ((availableUserDataStoragesInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageInfo>) => void)
    | null;
  onInitialisedUserDataStorageInfoChangedCallback: ((userDataStorageInfo: Readonly<IUserDataStorageInfo>) => void) | null;
  onAvailableUserDataBoxesChanged: ((availableDataBoxesChangedDiff: IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBoxInfo>) => void) | null;
  onAvailableUserDataTemplatesChanged:
    | ((availableDataTemplatesChangedDiff: IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplateInfo>) => void)
    | null;
  onAvailableUserDataEntriesChanged:
    | ((availableDataEntriesChangedDiff: IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo>) => void)
    | null;
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
  public readonly AVAILABLE_DATA_TEMPLATES_CONTEXT: AvailableUserDataTemplatesContext;
  public readonly AVAILABLE_DATA_ENTRIES_CONTEXT: AvailableUserDataEntriesContext;

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
    this.AVAILABLE_DATA_TEMPLATES_CONTEXT = new AvailableUserDataTemplatesContext(loggers.subcontexts.availableDataTemplates);
    this.AVAILABLE_DATA_ENTRIES_CONTEXT = new AvailableUserDataEntriesContext(loggers.subcontexts.availableDataEntries);
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
    this.wireAvailableUserDataTemplatesContextHandlers();
    this.wireAvailableUserDataEntriesContextHandlers();
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
    this.INITIALISED_DATA_STORAGES_CONTEXT.onAddedNewSecuredUserDataTemplateConfigsCallback = (
      newSecuredUserDataTemplateConfigs: ISecuredUserDataTemplateConfig[]
    ): void => {
      if (newSecuredUserDataTemplateConfigs.length > 0) {
        this.AVAILABLE_DATA_TEMPLATES_CONTEXT.addAvailableDataTemplates(
          newSecuredUserDataTemplateConfigs.map((newSecuredUserDataTemplateConfig: ISecuredUserDataTemplateConfig): IUserDataTemplate => {
            return securedUserDataTemplateConfigToUserDataTemplate(newSecuredUserDataTemplateConfig, null);
          })
        );
      }
    };
    this.INITIALISED_DATA_STORAGES_CONTEXT.onAddedNewUserDataEntriesCallback = (newUserDataEntries: IUserDataEntry[]): void => {
      if (newUserDataEntries.length > 0) {
        this.AVAILABLE_DATA_ENTRIES_CONTEXT.addAvailableDataEntries(newUserDataEntries);
      }
    };
    this.INITIALISED_DATA_STORAGES_CONTEXT.onOpenedInitialisedDataStorages = (openedDataStoragesInfo: IUserDataStorageInfo[]): void => {
      openedDataStoragesInfo.map((openedDataStorageInfo: IUserDataStorageInfo): void => {
        this.AVAILABLE_DATA_BOXES_CONTEXT.addAvailableDataBoxes(this.getAllDataBoxesFromDataStorage(openedDataStorageInfo.storageId as UUID));
      });
    };
    this.INITIALISED_DATA_STORAGES_CONTEXT.onClosedInitialisedDataStorages = (closedDataStoragesInfo: IUserDataStorageInfo[]): void => {
      closedDataStoragesInfo.map((closedDataStorageInfo: IUserDataStorageInfo): void => {
        this.AVAILABLE_DATA_BOXES_CONTEXT.removeAvailableDataBoxes(
          this.AVAILABLE_DATA_BOXES_CONTEXT.getAvailableDataBoxes()
            .filter((availableDataBox: IUserDataBox): boolean => {
              return availableDataBox.storageId === closedDataStorageInfo.storageId;
            })
            .map((availableDataBoxToBeRemoved: IUserDataBox): IUserDataBoxIdentifier => {
              return userDataBoxToUserDataBoxIdentifier(availableDataBoxToBeRemoved, null);
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
    this.logger.info("Wiring Available User Data Boxes Context handlers.");
    this.AVAILABLE_DATA_BOXES_CONTEXT.onAvailableDataBoxesChangedCallback = (
      availableDataBoxesChangedDiff: IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBox>
    ): void => {
      if (availableDataBoxesChangedDiff.removed.length > 0) {
        const DATA_TEMPLATE_IDENTIFIERS_TO_BE_REMOVED: IUserDataTemplateIdentifier[] =
          this.AVAILABLE_DATA_TEMPLATES_CONTEXT.getAllAvailableUserDataTemplateIdentifiersForUserDataBoxIdentifiers(
            availableDataBoxesChangedDiff.removed
          );
        if (DATA_TEMPLATE_IDENTIFIERS_TO_BE_REMOVED.length > 0) {
          this.AVAILABLE_DATA_TEMPLATES_CONTEXT.removeAvailableDataTemplates(DATA_TEMPLATE_IDENTIFIERS_TO_BE_REMOVED);
        }
      }
      if (availableDataBoxesChangedDiff.added.length > 0) {
        const DATA_TEMPLATES_TO_BE_ADDED: IUserDataTemplate[] = this.getAllDataTemplatesFromDataBoxes(availableDataBoxesChangedDiff.added);
        if (DATA_TEMPLATES_TO_BE_ADDED.length > 0) {
          this.AVAILABLE_DATA_TEMPLATES_CONTEXT.addAvailableDataTemplates(DATA_TEMPLATES_TO_BE_ADDED);
        }
      }
      if (availableDataBoxesChangedDiff.removed.length > 0 || availableDataBoxesChangedDiff.added.length > 0) {
        this.HANDLERS.onAvailableUserDataBoxesChanged?.({
          removed: availableDataBoxesChangedDiff.removed,
          added: availableDataBoxesChangedDiff.added.map((newUserDataBox: IUserDataBox): IUserDataBoxInfo => {
            return userDataBoxToUserDataBoxInfo(newUserDataBox, null);
          })
        } satisfies IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBoxInfo>);
      }
    };
  }

  private wireAvailableUserDataTemplatesContextHandlers(): void {
    this.logger.info("Wiring Available User Data Templates Context handlers.");
    this.AVAILABLE_DATA_TEMPLATES_CONTEXT.onAvailableDataTemplatesChangedCallback = (
      availableDataTemplatesChangedDiff: IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplate>
    ): void => {
      if (availableDataTemplatesChangedDiff.removed.length > 0) {
        const DATA_ENTRY_IDENTIFIERS_TO_BE_REMOVED: IUserDataEntryIdentifier[] =
          this.AVAILABLE_DATA_ENTRIES_CONTEXT.getAllAvailableUserDataEntryIdentifiersForUserDataTemplateIdentifiers(
            availableDataTemplatesChangedDiff.removed
          );
        if (DATA_ENTRY_IDENTIFIERS_TO_BE_REMOVED.length > 0) {
          this.AVAILABLE_DATA_ENTRIES_CONTEXT.removeAvailableDataEntries(DATA_ENTRY_IDENTIFIERS_TO_BE_REMOVED);
        }
      }
      if (availableDataTemplatesChangedDiff.added.length > 0) {
        const DATA_ENTRIES_TO_BE_ADDED: IUserDataEntry[] = this.getAllDataEntriesFromDataTemplates(availableDataTemplatesChangedDiff.added);
        if (DATA_ENTRIES_TO_BE_ADDED.length > 0) {
          this.AVAILABLE_DATA_ENTRIES_CONTEXT.addAvailableDataEntries(DATA_ENTRIES_TO_BE_ADDED);
        }
      }
      if (availableDataTemplatesChangedDiff.removed.length > 0 || availableDataTemplatesChangedDiff.added.length > 0) {
        this.HANDLERS.onAvailableUserDataTemplatesChanged?.({
          removed: availableDataTemplatesChangedDiff.removed,
          added: availableDataTemplatesChangedDiff.added.map((newUserDataTemplate: IUserDataTemplate): IUserDataTemplateInfo => {
            return userDataTemplateToUserDataTemplateInfo(newUserDataTemplate, null);
          })
        } satisfies IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplateInfo>);
      }
    };
  }

  private wireAvailableUserDataEntriesContextHandlers(): void {
    this.logger.info("Wiring Available User Data Entries Context handlers.");
    this.AVAILABLE_DATA_ENTRIES_CONTEXT.onAvailableDataEntriesChangedCallback = (
      availableDataEntriesChangedDiff: IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntry>
    ): void => {
      if (availableDataEntriesChangedDiff.removed.length > 0 || availableDataEntriesChangedDiff.added.length > 0) {
        this.HANDLERS.onAvailableUserDataEntriesChanged?.({
          removed: availableDataEntriesChangedDiff.removed,
          added: availableDataEntriesChangedDiff.added.map((newUserDataEntry: IUserDataEntry): IUserDataEntryInfo => {
            return userDataEntryToUserDataEntryInfo(newUserDataEntry, null);
          })
        } satisfies IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo>);
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

  private getAllDataBoxesFromDataStorage(dataStorageId: UUID): IUserDataBox[] {
    this.logger.info(`Getting all User Data Boxes from User Data Storage "${dataStorageId}".`);
    const SIGNED_IN_USER: ISignedInUser | null = this.AUTH_CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Null signed in user");
    }
    return this.INITIALISED_DATA_STORAGES_CONTEXT.getStorageSecuredUserDataBoxConfigsForUserDataStorage(dataStorageId, {
      includeIds: "all",
      excludeIds: null
    } satisfies IUserDataStorageUserDataBoxConfigFilter).map((storageSecuredDataBoxConfig: IStorageSecuredUserDataBoxConfig): IUserDataBox => {
      return securedUserDataBoxConfigToUserDataBox(
        // TODO: Is this really the correct encryption key to use here? Shouldn't it be the visibility group's key if there is a group?
        storageSecuredUserDataBoxConfigToSecuredUserDataBoxConfig(storageSecuredDataBoxConfig, SIGNED_IN_USER.userDataAESKey, null),
        null
      );
    });
  }

  private getAllDataTemplatesFromDataBoxes(dataBoxes: IUserDataBox[]): IUserDataTemplate[] {
    this.logger.info(`Getting all User Data Templates from ${dataBoxes.length.toString()} User Data Box${dataBoxes.length === 1 ? "" : "es"}.`);
    const SIGNED_IN_USER: ISignedInUser | null = this.AUTH_CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Null signed in user");
    }
    const STORAGE_ID_TO_BOX_IDS: Map<UUID, UUID[]> = new Map<UUID, UUID[]>();
    dataBoxes.forEach((dataBox: IUserDataBox): void => {
      const BOX_IDS: UUID[] = STORAGE_ID_TO_BOX_IDS.get(dataBox.storageId) ?? [];
      BOX_IDS.push(dataBox.boxId);
      STORAGE_ID_TO_BOX_IDS.set(dataBox.storageId, BOX_IDS);
    });
    const DATA_TEMPLATES: IUserDataTemplate[] = [];
    STORAGE_ID_TO_BOX_IDS.forEach((boxIds: UUID[], storageId: UUID): void => {
      const STORAGE_SECURED_DATA_TEMPLATE_CONFIGS: IStorageSecuredUserDataTemplateConfig[] =
        this.INITIALISED_DATA_STORAGES_CONTEXT.getStorageSecuredUserDataTemplates(storageId, {
          includeIds: "all",
          excludeIds: null,
          boxes: { includeIds: boxIds, excludeIds: null }
        } satisfies IUserDataStorageUserDataTemplateConfigFilter);
      STORAGE_SECURED_DATA_TEMPLATE_CONFIGS.forEach((storageSecuredUserDataTemplateConfig: IStorageSecuredUserDataTemplateConfig): void => {
        DATA_TEMPLATES.push(
          securedUserDataTemplateConfigToUserDataTemplate(
            storageSecuredUserDataTemplateConfigToSecuredUserDataTemplateConfig(
              storageSecuredUserDataTemplateConfig,
              SIGNED_IN_USER.userDataAESKey,
              null
            ),
            null
          )
        );
      });
    });
    return DATA_TEMPLATES;
  }

  private getAllDataEntriesFromDataTemplates(dataTemplates: IUserDataTemplate[]): IUserDataEntry[] {
    this.logger.info(
      `Getting all User Data Entries from ${dataTemplates.length.toString()} User Data Templates${dataTemplates.length === 1 ? "" : "es"}.`
    );
    const SIGNED_IN_USER: ISignedInUser | null = this.AUTH_CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Null signed in user");
    }
    const STORAGE_ID_TO_TEMPLATE_IDS: Map<UUID, UUID[]> = new Map<UUID, UUID[]>();
    dataTemplates.forEach((dataTemplate: IUserDataTemplate): void => {
      const TEMPLATE_IDS: UUID[] = STORAGE_ID_TO_TEMPLATE_IDS.get(dataTemplate.storageId) ?? [];
      TEMPLATE_IDS.push(dataTemplate.templateId);
      STORAGE_ID_TO_TEMPLATE_IDS.set(dataTemplate.storageId, TEMPLATE_IDS);
    });
    let dataEntries: IUserDataEntry[] = [];
    STORAGE_ID_TO_TEMPLATE_IDS.forEach((templateIds: UUID[], storageId: UUID): void => {
      const STORAGE_SECURED_DATA_ENTRIES: IStorageSecuredUserDataEntry[] = this.INITIALISED_DATA_STORAGES_CONTEXT.getStorageSecuredUserDataEntries(
        storageId,
        {
          includeIds: "all",
          excludeIds: null,
          templates: {
            includeIds: templateIds,
            excludeIds: null
          }
        } satisfies IUserDataStorageUserDataEntryFilter
      );
      STORAGE_SECURED_DATA_ENTRIES.forEach((storageSecuredUserDataEntry: IStorageSecuredUserDataEntry): void => {
        dataEntries.push(storageSecuredUserDataEntryToUserDataEntry(storageSecuredUserDataEntry, SIGNED_IN_USER.userDataAESKey, null));
      });
    });
    if (dataEntries.length > 0) {
      this.logger.debug("Validating read User Data Entries against their User Data Templates.");
      const TEMPLATE_IDENTIFIER_TO_ENTRIES: Map<IUserDataTemplateIdentifier, IUserDataEntry[]> = new Map<
        IUserDataTemplateIdentifier,
        IUserDataEntry[]
      >();
      dataEntries.forEach((userDataEntry: IUserDataEntry): void => {
        const TEMPLATE_IDENTIFIER_FOR_CURRENT_ENTRY: IUserDataTemplateIdentifier = {
          templateId: userDataEntry.templateId,
          boxId: userDataEntry.boxId,
          storageId: userDataEntry.storageId
        } satisfies IUserDataTemplateIdentifier;
        const ENTRIES: IUserDataEntry[] = TEMPLATE_IDENTIFIER_TO_ENTRIES.get(TEMPLATE_IDENTIFIER_FOR_CURRENT_ENTRY) ?? [];
        ENTRIES.push(userDataEntry);
        TEMPLATE_IDENTIFIER_TO_ENTRIES.set(TEMPLATE_IDENTIFIER_FOR_CURRENT_ENTRY, ENTRIES);
      });
      const INVALID_DATA_ENTRIES_IDENTIFIERS: IUserDataEntryIdentifier[] = [];
      TEMPLATE_IDENTIFIER_TO_ENTRIES.forEach((userDataEntries: IUserDataEntry[], templateIdentifier: IUserDataTemplateIdentifier): void => {
        const MATCHING_TEMPLATE: IUserDataTemplate | undefined = this.AVAILABLE_DATA_TEMPLATES_CONTEXT.getAvailableDataTemplates().find(
          (availableUserDataTemplate: IUserDataTemplate): boolean => {
            return isUserDataTemplateIdentifierMatchingUserDataTemplate(templateIdentifier, availableUserDataTemplate);
          }
        );
        if (MATCHING_TEMPLATE === undefined) {
          throw new Error(
            `Unavailable User Data Template "${templateIdentifier.templateId}" from User Data Box "${templateIdentifier.boxId}" from User Data Storage "${templateIdentifier.storageId}"`
          );
        }
        const MATCHING_TEMPLATE_ENTRY_JSON_SCHEMA: JSONSchemaType<IUserDataEntry> = getUserDataEntryJSONSchemaFromTemplateInfo(
          userDataTemplateToUserDataTemplateInfo(MATCHING_TEMPLATE, null),
          null
        );
        const MATCHING_TEMPLATE_ENTRY_JSON_SCHEMA_VALIDATE_FUNCTION: ValidateFunction<IUserDataEntry> =
          AJV.compile<IUserDataEntry>(MATCHING_TEMPLATE_ENTRY_JSON_SCHEMA);
        userDataEntries.forEach((userDataEntry: IUserDataEntry): void => {
          if (!MATCHING_TEMPLATE_ENTRY_JSON_SCHEMA_VALIDATE_FUNCTION(userDataEntry)) {
            this.logger.error(
              `Invalid User Data Entry "${(userDataEntry as IUserDataEntry).entryId}" found for User Data Template "${
                MATCHING_TEMPLATE.templateId
              }" from User Data Box "${MATCHING_TEMPLATE.boxId}" from User Data Storage "${MATCHING_TEMPLATE.storageId}".`
            );
            INVALID_DATA_ENTRIES_IDENTIFIERS.push(userDataEntryToUserDataEntryIdentifier(userDataEntry, null));
          }
        });
      });
      if (INVALID_DATA_ENTRIES_IDENTIFIERS.length > 0) {
        dataEntries = dataEntries.filter((dataEntry: IUserDataEntry): boolean => {
          return !INVALID_DATA_ENTRIES_IDENTIFIERS.some((invalidUserDataEntryIdentifier: IUserDataEntryIdentifier): boolean => {
            return isUserDataEntryIdentifierMatchingUserDataEntry(invalidUserDataEntryIdentifier, dataEntry);
          });
        });
      } else {
        this.logger.debug("All User Data Entries are valid against their User Data Templates.");
      }
    }
    return dataEntries;
  }
}
