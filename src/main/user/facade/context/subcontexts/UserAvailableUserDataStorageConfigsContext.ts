import { ISecuredUserDataStorageConfig, isValidSecuredUserDataStorageConfigArray } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { isValidUUIDArray } from "@main/utils/dataValidation/isValidUUID";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export class UserAvailableUserDataStorageConfigsContext {
  private readonly logger: LogFunctions;

  private availableDataStorageConfigs: ISecuredUserDataStorageConfig[];

  public onAvailableUserDataStorageConfigsChangedCallback:
    | ((availableDataStorageConfigsChangedDiff: IDataChangedDiff<UUID, IUserDataStorageConfig>) => void)
    | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new User Available User Data Storages Context.");
    this.availableDataStorageConfigs = [];
    this.onAvailableUserDataStorageConfigsChangedCallback = null;
  }

  public getAvailableDataStorageConfigs(): ISecuredUserDataStorageConfig[] {
    this.logger.info("Getting available User Data Storage Configs.");
    return this.availableDataStorageConfigs;
  }

  public addAvailableDataStorageConfigs(newDataStorageConfigs: ISecuredUserDataStorageConfig[]): number {
    this.logger.info(
      `Adding ${newDataStorageConfigs.length.toString()} new available User Data Storage Config${newDataStorageConfigs.length === 1 ? "" : "s"}.`
    );
    if (!isValidSecuredUserDataStorageConfigArray(newDataStorageConfigs)) {
      throw new Error("Invalid newly available Secured User Data Storage Config array");
    }
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
      // TODO: Make proper diff type
      this.onAvailableUserDataStorageConfigsChangedCallback?.({
        removed: [],
        added: NEW_DATA_STORAGES
      } satisfies IDataChangedDiff<UUID, IUserDataStorageConfig>);
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
      this.onAvailableUserDataStorageConfigsChangedCallback?.({
        removed: DATA_STORAGE_IDS,
        added: []
      } satisfies IDataChangedDiff<UUID, IUserDataStorageConfig>);
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
    this.onAvailableUserDataStorageConfigsChangedCallback?.({
      removed: AVAILABLE_DATA_STORAGE_CONFIG_IDS,
      added: []
    } satisfies IDataChangedDiff<UUID, IUserDataStorageConfig>);
    return AVAILABLE_DATA_STORAGE_CONFIG_IDS.length;
  }
}
