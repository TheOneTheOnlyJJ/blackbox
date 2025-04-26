import { ISecuredUserDataBoxConfig } from "@main/user/data/box/config/SecuredUserDataBoxConfig";
import { IStorageSecuredUserDataBoxConfig } from "@main/user/data/box/config/StorageSecuredUserDataBoxConfig";
import { securedUserDataBoxConfigToStorageSecuredUserDataBoxConfig } from "@main/user/data/box/config/utils/securedUserDataBoxConfigToStorageSecuredUserDataBoxConfig";
import {
  IUserDataStorageUserDataBoxConfigFilter,
  IUserDataStorageUserDataTemplateConfigFilter
} from "@main/user/data/storage/backend/BaseUserDataStorageBackend";
import { isValidSecuredUserDataStorageConfigArray } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { IUserDataStorageHandlers, UserDataStorage } from "@main/user/data/storage/UserDataStorage";
import { ISecuredUserDataTemplateConfig } from "@main/user/data/template/config/SecuredUserDataTemplateConfig";
import { IStorageSecuredUserDataTemplateConfig } from "@main/user/data/template/config/StorageSecuredUserDataTemplateConfig";
import { securedUserDataTemplateConfigToStorageSecuredUserDataTemplateConfig } from "@main/user/data/template/config/utils/securedUserDataTemplateConfigToStorageSecuredUserDataTemplateConfig";
import { isValidUUIDArray } from "@main/utils/dataValidation/isValidUUID";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

const INITIAL_AVAILABLE_DATA_STORAGES: UserDataStorage[] = [];

export class InitialisedUserDataStoragesContext {
  private readonly logger: LogFunctions;

  // TODO: Replace with Map
  private initialisedDataStorages: UserDataStorage[];

  public onInitialisedUserDataStoragesChangedCallback:
    | ((initialisedDataStoragesChangedDiff: IDataChangedDiff<IUserDataStorageConfig, UserDataStorage>) => void)
    | null;
  public onInitialisedUserDataStorageInfoChangedCallback: ((userDataStorageInfo: Readonly<IUserDataStorageInfo>) => void) | null;
  public onAddedNewSecuredUserDataBoxConfigsCallback: ((newSecuredUserDataBoxConfigs: ISecuredUserDataBoxConfig[]) => void) | null;
  public onAddedNewSecuredUserDataTemplateConfigsCallback: ((newSecuredUserDataTemplateConfigs: ISecuredUserDataTemplateConfig[]) => void) | null;
  public onOpenedInitialisedDataStorages: ((openedDataStoragesInfo: IUserDataStorageInfo[]) => void) | null;
  public onClosedInitialisedDataStorages: ((closedDataStoragesInfo: IUserDataStorageInfo[]) => void) | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new Initialised User Data Storages Context.");
    this.initialisedDataStorages = INITIAL_AVAILABLE_DATA_STORAGES;
    this.onInitialisedUserDataStoragesChangedCallback = null;
    this.onInitialisedUserDataStorageInfoChangedCallback = null;
    this.onAddedNewSecuredUserDataBoxConfigsCallback = null;
    this.onAddedNewSecuredUserDataTemplateConfigsCallback = null;
    this.onOpenedInitialisedDataStorages = null;
    this.onClosedInitialisedDataStorages = null;
  }

  public initialiseDataStoragesFromConfigs(securedDataStorageConfigs: IUserDataStorageConfig[]): number {
    this.logger.info(
      `Initialising ${securedDataStorageConfigs.length.toString()} new User Data Storage${
        securedDataStorageConfigs.length === 1 ? "" : "s"
      } from Secured User Data Storage Configs.`
    );
    if (!isValidSecuredUserDataStorageConfigArray(securedDataStorageConfigs)) {
      throw new Error("Invalid Secured User Data Storage Config array");
    }
    if (securedDataStorageConfigs.length === 0) {
      this.logger.warn("Given no Secured User Data Storage Configs to initialise.");
      return 0;
    }
    const SECURED_DATA_STORAGE_CONFIGS_TO_INITIALISE: IUserDataStorageConfig[] = securedDataStorageConfigs.filter(
      (securedUserDataStorageConfig: IUserDataStorageConfig): boolean => {
        const IS_ALREADY_AVAILABLE: boolean = this.initialisedDataStorages.some((availableDataStorage: UserDataStorage): boolean => {
          return securedUserDataStorageConfig.storageId === availableDataStorage.storageId;
        });
        if (IS_ALREADY_AVAILABLE) {
          this.logger.warn(`Skip initialising already available given User Data Storage "${securedUserDataStorageConfig.storageId}".`);
        }
        return !IS_ALREADY_AVAILABLE; // Only keep new data storage configs of storages that are NOT already initialised
      }
    );
    const NEW_INITIALISED_DATA_STORAGES: UserDataStorage[] = [];
    SECURED_DATA_STORAGE_CONFIGS_TO_INITIALISE.map((securedUserDataStorageConfig: IUserDataStorageConfig): void => {
      try {
        const NEW_DATA_STORAGE: UserDataStorage = new UserDataStorage(
          securedUserDataStorageConfig,
          `m-udata-strg-${securedUserDataStorageConfig.storageId}`,
          {
            onInfoChanged: (newInfo: Readonly<IUserDataStorageInfo>): void => {
              this.onInitialisedUserDataStorageInfoChangedCallback?.(newInfo);
            },
            onOpened: (info: Readonly<IUserDataStorageInfo>): void => {
              this.onOpenedInitialisedDataStorages?.([info]);
            },
            onClosed: (info: Readonly<IUserDataStorageInfo>): void => {
              this.onClosedInitialisedDataStorages?.([info]);
            }
          } satisfies IUserDataStorageHandlers
        );
        NEW_INITIALISED_DATA_STORAGES.push(NEW_DATA_STORAGE);
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.logger.error(`User Data Storage initialisation error: ${ERROR_MESSAGE}!`);
      }
    });
    this.initialisedDataStorages.push(...NEW_INITIALISED_DATA_STORAGES);
    this.logger.info(
      `Initialised ${NEW_INITIALISED_DATA_STORAGES.length.toString()} new User Data Storage${NEW_INITIALISED_DATA_STORAGES.length === 1 ? "" : "s"}.`
    );
    if (NEW_INITIALISED_DATA_STORAGES.length > 0) {
      this.onInitialisedUserDataStoragesChangedCallback?.({
        removed: [],
        added: NEW_INITIALISED_DATA_STORAGES
      } satisfies IDataChangedDiff<UUID, UserDataStorage>);
    }
    return NEW_INITIALISED_DATA_STORAGES.length;
  }

  public terminateDataStoragesFromIds(dataStorageIds: UUID[]): number {
    this.logger.info(`Terminating ${dataStorageIds.length.toString()} User Data Storage${dataStorageIds.length === 1 ? "" : "s"}.`);
    if (this.initialisedDataStorages.length === 0) {
      this.logger.info("No initialised User Data Storages to terminate from.");
      return 0;
    }
    if (!isValidUUIDArray(dataStorageIds)) {
      throw new Error("Invalid User Data Storage ID array");
    }
    if (dataStorageIds.length === 0) {
      this.logger.warn("Given no User Data Storage IDs to terminate.");
      return 0;
    }
    const DATA_STORAGE_IDS_TO_TERMINATE: UUID[] = dataStorageIds.filter((dataStorageId: UUID): boolean => {
      const IS_INITIALISED: boolean = this.initialisedDataStorages.some((initialisedDataStorage: UserDataStorage): boolean => {
        return dataStorageId === initialisedDataStorage.storageId;
      });
      if (!IS_INITIALISED) {
        this.logger.warn(`Skip terminating uninitialised given User Data Storage "${dataStorageId}".`);
      }
      return IS_INITIALISED;
    });
    const TERMINATED_DATA_STORAGES_CONFIGS: IUserDataStorageConfig[] = [];
    for (let idx = this.initialisedDataStorages.length - 1; idx >= 0; idx--) {
      const AVAILABLE_DATA_STORAGE: UserDataStorage = this.initialisedDataStorages[idx];
      if (DATA_STORAGE_IDS_TO_TERMINATE.includes(AVAILABLE_DATA_STORAGE.storageId)) {
        if (AVAILABLE_DATA_STORAGE.isOpen()) {
          AVAILABLE_DATA_STORAGE.close();
        }
        TERMINATED_DATA_STORAGES_CONFIGS.push(AVAILABLE_DATA_STORAGE.getConfig());
        this.initialisedDataStorages.splice(idx, 1); // Remove from array in-place
      }
    }
    this.logger.info(
      `Terminated ${DATA_STORAGE_IDS_TO_TERMINATE.length.toString()} User Data Storage${DATA_STORAGE_IDS_TO_TERMINATE.length === 1 ? "" : "s"}.`
    );
    if (TERMINATED_DATA_STORAGES_CONFIGS.length > 0) {
      this.onInitialisedUserDataStoragesChangedCallback?.({
        removed: TERMINATED_DATA_STORAGES_CONFIGS,
        added: []
      } satisfies IDataChangedDiff<IUserDataStorageConfig, UserDataStorage>);
    }
    return DATA_STORAGE_IDS_TO_TERMINATE.length;
  }

  public terminateAllInitialisedDataStorages(): number {
    this.logger.info("Terminating all initialised User Data Storages.");
    if (this.initialisedDataStorages.length === 0) {
      this.logger.info("No initialised User Data Storages to terminate.");
      return 0;
    }
    const SECURED_DATA_STORAGES_CONFIGS_TO_TERMINATE: IUserDataStorageConfig[] = this.initialisedDataStorages.map(
      (initialisedDataStorage: UserDataStorage): IUserDataStorageConfig => {
        if (initialisedDataStorage.isOpen()) {
          initialisedDataStorage.close();
        }
        return initialisedDataStorage.getConfig();
      }
    );
    this.initialisedDataStorages = [];
    this.logger.info(`Terminated all User Data Storages (${SECURED_DATA_STORAGES_CONFIGS_TO_TERMINATE.length.toString()}).`);
    this.onInitialisedUserDataStoragesChangedCallback?.({
      removed: SECURED_DATA_STORAGES_CONFIGS_TO_TERMINATE,
      added: []
    } satisfies IDataChangedDiff<IUserDataStorageConfig, UserDataStorage>);
    return SECURED_DATA_STORAGES_CONFIGS_TO_TERMINATE.length;
  }

  public getAllInitialisedDataStorageIdsForVisibilityGroupIds(visibilityGroupIds: UUID[]): UUID[] {
    this.logger.info(
      `Getting all initialised User Data Storage IDs for ${visibilityGroupIds.length.toString()} User Data Storage Visibility Group ID${
        visibilityGroupIds.length === 1 ? "" : "s"
      }.`
    );
    if (this.initialisedDataStorages.length === 0) {
      return [];
    }
    const DATA_STORAGE_IDS: UUID[] = [];
    for (const VISIBILITY_GROUP_ID of visibilityGroupIds) {
      for (const INITIALISED_DATA_STORAGE of this.initialisedDataStorages) {
        if (VISIBILITY_GROUP_ID === INITIALISED_DATA_STORAGE.visibilityGroupId) {
          DATA_STORAGE_IDS.push(INITIALISED_DATA_STORAGE.storageId);
        }
      }
    }
    return DATA_STORAGE_IDS;
  }

  public openInitialisedDataStorages(dataStorageIds: UUID[]): number {
    this.logger.info(`Opening ${dataStorageIds.length.toString()} User Data Storage${dataStorageIds.length === 1 ? "" : "s"}.`);
    if (this.initialisedDataStorages.length === 0) {
      this.logger.info("No initialised User Data Storages to open from.");
      return 0;
    }
    if (!isValidUUIDArray(dataStorageIds)) {
      throw new Error("Invalid User Data Storage ID array");
    }
    if (dataStorageIds.length === 0) {
      this.logger.warn("Given no User Data Storage IDs to open.");
      return 0;
    }
    const OPENED_DATA_STORAGES_INFO: IUserDataStorageInfo[] = [];
    dataStorageIds.map((dataStorageId: UUID): void => {
      let wasFound = false;
      for (const INITIALISED_DATA_STORAGE of this.initialisedDataStorages) {
        if (INITIALISED_DATA_STORAGE.storageId === dataStorageId) {
          if (INITIALISED_DATA_STORAGE.isOpen()) {
            this.logger.warn(`Skip opening already open given initialised User Data Storage "${dataStorageId}".`);
          } else {
            if (INITIALISED_DATA_STORAGE.open()) {
              OPENED_DATA_STORAGES_INFO.push(INITIALISED_DATA_STORAGE.getInfo());
            }
          }
          wasFound = true;
        }
      }
      if (!wasFound) {
        this.logger.warn(`Skip opening given missing initialised User Data Storage "${dataStorageId}".`);
      }
    });
    return OPENED_DATA_STORAGES_INFO.length;
  }

  public closeInitialisedDataStorages(dataStorageIds: UUID[]): number {
    this.logger.info(`Closing ${dataStorageIds.length.toString()} User Data Storage${dataStorageIds.length === 1 ? "" : "s"}.`);
    if (this.initialisedDataStorages.length === 0) {
      this.logger.info("No initialised User Data Storages to close from.");
      return 0;
    }
    if (!isValidUUIDArray(dataStorageIds)) {
      throw new Error("Invalid User Data Storage ID array");
    }
    if (dataStorageIds.length === 0) {
      this.logger.warn("Given no User Data Storage IDs to close.");
      return 0;
    }
    const CLOSED_DATA_STORAGES_INFO: IUserDataStorageInfo[] = [];
    dataStorageIds.map((dataStorageId: UUID): void => {
      let wasFound = false;
      for (const INITIALISED_DATA_STORAGE of this.initialisedDataStorages) {
        if (INITIALISED_DATA_STORAGE.storageId === dataStorageId) {
          if (INITIALISED_DATA_STORAGE.isClosed()) {
            this.logger.warn(`Skip closing already closed given initialised User Data Storage "${dataStorageId}".`);
          } else {
            if (INITIALISED_DATA_STORAGE.close()) {
              CLOSED_DATA_STORAGES_INFO.push(INITIALISED_DATA_STORAGE.getInfo());
            }
          }
          wasFound = true;
        }
      }
      if (!wasFound) {
        this.logger.warn(`Skip closing given missing initialised User Data Storage "${dataStorageId}".`);
      }
    });
    return CLOSED_DATA_STORAGES_INFO.length;
  }

  public getAllSignedInUserInitialisedDataStoragesInfo(): IUserDataStorageInfo[] {
    this.logger.debug("Getting all signed in user's initialised User Data Storages Info.");
    return this.initialisedDataStorages.map((initialisedDataStorage: UserDataStorage): IUserDataStorageInfo => {
      return initialisedDataStorage.getInfo();
    });
  }

  public getAllSignedInUserInitialisedOpenDataStoragesInfo(): IUserDataStorageInfo[] {
    this.logger.debug("Getting all signed in user's initialised open User Data Storages Info.");
    return this.initialisedDataStorages
      .filter((initialisedDataStorage: UserDataStorage): boolean => {
        return initialisedDataStorage.isOpen();
      })
      .map((initialisedDataStorage: UserDataStorage): IUserDataStorageInfo => {
        return initialisedDataStorage.getInfo();
      });
  }

  public isDataStorageInitialised(storageId: UUID, doLog: boolean): boolean {
    if (doLog) {
      this.logger.debug(`Checking if User Data Storage "${storageId}" is initialised.`);
    }
    return this.initialisedDataStorages.some((initialisedStorage: UserDataStorage): boolean => {
      return initialisedStorage.storageId === storageId;
    });
  }

  public generateRandomDataBoxId(userDataStorageId: UUID): UUID {
    this.logger.debug(`Generating random User Data Box ID for User Data Storage "${userDataStorageId}".`);
    for (const INITIALISED_DATA_STORAGE of this.initialisedDataStorages) {
      if (INITIALISED_DATA_STORAGE.storageId === userDataStorageId) {
        return INITIALISED_DATA_STORAGE.generateRandomDataBoxId();
      }
    }
    throw new Error(`Cannot generate random User Data Box ID for missing initialised User Data Storage "${userDataStorageId}"`);
  }

  public generateRandomDataTemplateId(userDataStorageId: UUID, userDataBoxId: UUID): UUID {
    this.logger.debug(`Generating random User Data Template ID for User Data Storage "${userDataStorageId}" and User Data Box "${userDataBoxId}".`);
    for (const INITIALISED_DATA_STORAGE of this.initialisedDataStorages) {
      if (INITIALISED_DATA_STORAGE.storageId === userDataStorageId) {
        return INITIALISED_DATA_STORAGE.generateRandomDataTemplateId(userDataBoxId);
      }
    }
    throw new Error(`Cannot generate random User Data Template ID for missing initialised User Data Storage "${userDataStorageId}"`);
  }

  public addSecuredUserDataBoxConfig(securedUserDataBoxConfig: ISecuredUserDataBoxConfig, encryptionAESKey: Buffer): boolean {
    this.logger.debug(`Adding Secured User Data Box Config to User Data Storage "${securedUserDataBoxConfig.storageId}".`);
    for (const INITIALISED_DATA_STORAGE of this.initialisedDataStorages) {
      if (INITIALISED_DATA_STORAGE.storageId === securedUserDataBoxConfig.storageId) {
        const WAS_ADDED: boolean = INITIALISED_DATA_STORAGE.addStorageSecuredUserDataBoxConfig(
          securedUserDataBoxConfigToStorageSecuredUserDataBoxConfig(securedUserDataBoxConfig, encryptionAESKey, this.logger)
        );
        if (WAS_ADDED) {
          this.onAddedNewSecuredUserDataBoxConfigsCallback?.([securedUserDataBoxConfig]);
        }
        return WAS_ADDED;
      }
    }
    throw new Error(`Cannot add Secured User Data Box Config for missing initialised User Data Storage "${securedUserDataBoxConfig.storageId}"`);
  }

  public addSecuredUserDataTemplateConfig(securedUserDataTemplateConfig: ISecuredUserDataTemplateConfig, encryptionAESKey: Buffer): boolean {
    this.logger.debug(`Adding Secured User Data Template Config to User Data Storage "${securedUserDataTemplateConfig.storageId}".`);
    for (const INITIALISED_DATA_STORAGE of this.initialisedDataStorages) {
      if (INITIALISED_DATA_STORAGE.storageId === securedUserDataTemplateConfig.storageId) {
        const WAS_ADDED: boolean = INITIALISED_DATA_STORAGE.addStorageSecuredUserDataTemplateConfig(
          securedUserDataTemplateConfigToStorageSecuredUserDataTemplateConfig(securedUserDataTemplateConfig, encryptionAESKey, this.logger)
        );
        if (WAS_ADDED) {
          this.onAddedNewSecuredUserDataTemplateConfigsCallback?.([securedUserDataTemplateConfig]);
        }
        return WAS_ADDED;
      }
    }
    throw new Error(
      `Cannot add Secured User Data Template Config for missing initialised User Data Storage "${securedUserDataTemplateConfig.storageId}"`
    );
  }

  public getStorageSecuredUserDataBoxConfigsForUserDataStorage(
    userDataStorageId: UUID,
    filter: IUserDataStorageUserDataBoxConfigFilter
  ): IStorageSecuredUserDataBoxConfig[] {
    this.logger.debug(`Getting Storage Secured User Data Box Configs for User Data Storage "${userDataStorageId}".`);
    for (const INITIALISED_DATA_STORAGE of this.initialisedDataStorages) {
      if (INITIALISED_DATA_STORAGE.storageId === userDataStorageId) {
        // TODO: Add filter here like in user account storage
        return INITIALISED_DATA_STORAGE.getStorageSecuredUserDataBoxConfigs(filter);
      }
    }
    throw new Error(`Cannot get Storage Secured User Data Box Configs for missing initialised User Data Storage "${userDataStorageId}"`);
  }

  public getStorageSecuredUserDataTemplates(
    userDataStorageId: UUID,
    filter: IUserDataStorageUserDataTemplateConfigFilter
  ): IStorageSecuredUserDataTemplateConfig[] {
    this.logger.debug(`Getting Storage Secured User Data Template Configs from User Data Storage "${userDataStorageId}".`);
    for (const INITIALISED_DATA_STORAGE of this.initialisedDataStorages) {
      if (INITIALISED_DATA_STORAGE.storageId === userDataStorageId) {
        // TODO: Add filter here like in user account storage
        return INITIALISED_DATA_STORAGE.getStorageSecuredUserDataTemplateConfigs(filter);
      }
    }
    throw new Error(`Cannot get Storage Secured User Data Template Configs for missing initialised User Data Storage "${userDataStorageId}"`);
  }
}
