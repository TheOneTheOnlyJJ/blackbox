import { ISecuredUserDataStorageConfig, isValidSecuredUserDataStorageConfigArray } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { isValidUUIDArray } from "@main/utils/dataValidation/isValidUUID";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export class UserAvailableUserDataStorageConfigsContext {
  private readonly logger: LogFunctions;

  // TODO: Replace with Map
  private availableSecuredDataStorageConfigs: ISecuredUserDataStorageConfig[];

  public onAvailableSecuredUserDataStorageConfigsChangedCallback:
    | ((availableSecuredDataStorageConfigsChangedDiff: IDataChangedDiff<UUID, ISecuredUserDataStorageConfig>) => void)
    | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new User Available User Data Storages Context.");
    this.availableSecuredDataStorageConfigs = [];
    this.onAvailableSecuredUserDataStorageConfigsChangedCallback = null;
  }

  public getAvailableSecuredDataStorageConfigs(): ISecuredUserDataStorageConfig[] {
    this.logger.info("Getting available Secured User Data Storage Configs.");
    return this.availableSecuredDataStorageConfigs;
  }

  public addAvailableSecuredDataStorageConfigs(newSecuredDataStorageConfigs: ISecuredUserDataStorageConfig[]): number {
    this.logger.info(
      `Adding ${newSecuredDataStorageConfigs.length.toString()} new available Secured User Data Storage Config${
        newSecuredDataStorageConfigs.length === 1 ? "" : "s"
      }.`
    );
    if (!isValidSecuredUserDataStorageConfigArray(newSecuredDataStorageConfigs)) {
      throw new Error("Invalid newly available Secured User Data Storage Config array");
    }
    if (newSecuredDataStorageConfigs.length === 0) {
      this.logger.warn("Given no new Secured User Data Storage Configs to add.");
      return 0;
    }
    const NEW_SECURED_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = newSecuredDataStorageConfigs.filter(
      (newSecuredDataStorageConfig: ISecuredUserDataStorageConfig): boolean => {
        const IS_ALREADY_AVAILABLE: boolean = this.availableSecuredDataStorageConfigs.some(
          (availableDataStorage: ISecuredUserDataStorageConfig): boolean => {
            return newSecuredDataStorageConfig.storageId === availableDataStorage.storageId;
          }
        );
        if (IS_ALREADY_AVAILABLE) {
          this.logger.warn(`Skip adding already available given Secured User Data Storage Config "${newSecuredDataStorageConfig.storageId}".`);
        }
        return !IS_ALREADY_AVAILABLE; // Only keep new secured data storage configs that are NOT already available
      }
    );
    this.availableSecuredDataStorageConfigs.push(...NEW_SECURED_DATA_STORAGE_CONFIGS);
    this.logger.info(
      `Added ${NEW_SECURED_DATA_STORAGE_CONFIGS.length.toString()} new available Secured User Data Storage Config${
        NEW_SECURED_DATA_STORAGE_CONFIGS.length === 1 ? "" : "s"
      }.`
    );
    if (NEW_SECURED_DATA_STORAGE_CONFIGS.length > 0) {
      // TODO: Make proper diff type
      this.onAvailableSecuredUserDataStorageConfigsChangedCallback?.({
        removed: [],
        added: NEW_SECURED_DATA_STORAGE_CONFIGS
      } satisfies IDataChangedDiff<UUID, ISecuredUserDataStorageConfig>);
    }
    return NEW_SECURED_DATA_STORAGE_CONFIGS.length;
  }

  public removeAvailableSecuredDataStorageConfigs(securedDataStorageConfigIds: UUID[]): number {
    this.logger.info(
      `Removing ${securedDataStorageConfigIds.length.toString()} available Secured User Data Storage Config${
        securedDataStorageConfigIds.length === 1 ? "" : "s"
      }.`
    );
    if (this.availableSecuredDataStorageConfigs.length === 0) {
      this.logger.info("No available Secured User Data Storage Configs to remove from.");
      return 0;
    }
    if (!isValidUUIDArray(securedDataStorageConfigIds)) {
      throw new Error("Invalid Secured User Data Storage Config ID array");
    }
    if (securedDataStorageConfigIds.length === 0) {
      this.logger.warn("Given no Secured User Data Storage Config IDs to remove.");
      return 0;
    }
    const SECURED_DATA_STORAGE_CONFIG_IDS: UUID[] = securedDataStorageConfigIds.filter((securedDataStorageId: UUID): boolean => {
      const IS_AVAILABLE: boolean = this.availableSecuredDataStorageConfigs.some(
        (availableSecuredDataStorageConfig: ISecuredUserDataStorageConfig): boolean => {
          return securedDataStorageId === availableSecuredDataStorageConfig.storageId;
        }
      );
      if (!IS_AVAILABLE) {
        this.logger.warn(`Skip removing unavailable given Secured User Data Storage Config "${securedDataStorageId}".`);
      }
      return IS_AVAILABLE;
    });
    for (let idx = this.availableSecuredDataStorageConfigs.length - 1; idx >= 0; idx--) {
      const AVAILABLE_SECURED_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = this.availableSecuredDataStorageConfigs[idx];
      if (SECURED_DATA_STORAGE_CONFIG_IDS.includes(AVAILABLE_SECURED_DATA_STORAGE_CONFIG.storageId)) {
        // AVAILABLE_DATA_STORAGE_CONFIG.close(); // TODO: CLEANUP?
        this.availableSecuredDataStorageConfigs.splice(idx, 1); // Remove from array in-place
      }
    }
    this.logger.info(
      `Removed ${SECURED_DATA_STORAGE_CONFIG_IDS.length.toString()} available User Data Storage Config${
        SECURED_DATA_STORAGE_CONFIG_IDS.length === 1 ? "" : "s"
      }.`
    );
    if (SECURED_DATA_STORAGE_CONFIG_IDS.length > 0) {
      this.onAvailableSecuredUserDataStorageConfigsChangedCallback?.({
        removed: SECURED_DATA_STORAGE_CONFIG_IDS,
        added: []
      } satisfies IDataChangedDiff<UUID, ISecuredUserDataStorageConfig>);
    }
    return SECURED_DATA_STORAGE_CONFIG_IDS.length;
  }

  public clearAvailableSecuredDataStorageConfigs(): number {
    this.logger.info("Clearing available Secured User Data Storage Configs.");
    if (this.availableSecuredDataStorageConfigs.length === 0) {
      this.logger.info("No available Secured User Data Storage Configs to clear.");
      return 0;
    }
    const AVAILABLE_SECURED_DATA_STORAGE_CONFIG_IDS: UUID[] = this.availableSecuredDataStorageConfigs.map(
      (availableSecuredDataStorage: ISecuredUserDataStorageConfig): UUID => {
        // availableDataStorage.close(); // TODO: Cleanup?
        return availableSecuredDataStorage.storageId;
      }
    );
    this.availableSecuredDataStorageConfigs = [];
    this.logger.info(`Cleared available Secured User Data Storage Configs (${AVAILABLE_SECURED_DATA_STORAGE_CONFIG_IDS.length.toString()}).`);
    this.onAvailableSecuredUserDataStorageConfigsChangedCallback?.({
      removed: AVAILABLE_SECURED_DATA_STORAGE_CONFIG_IDS,
      added: []
    } satisfies IDataChangedDiff<UUID, ISecuredUserDataStorageConfig>);
    return AVAILABLE_SECURED_DATA_STORAGE_CONFIG_IDS.length;
  }
}
