import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IUserDataStorageServiceContext {
  initialiseDataStoragesFromConfigs: (newSecuredDataStorageConfigs: IUserDataStorageConfig[]) => number;
  terminateDataStoragesFromIds: (dataStorageIds: UUID[]) => number;
  openInitialisedDataStorages: (dataStorageIds: UUID[]) => number;
  closeInitialisedDataStorages: (dataStorageIds: UUID[]) => number;
  getAllSignedInUserInitialisedDataStoragesInfo: () => IUserDataStorageInfo[];
  getAvailableSecuredDataStorageConfigs: () => ISecuredUserDataStorageConfig[];
}

export class UserDataStorageService {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: IUserDataStorageServiceContext;

  public constructor(logger: LogFunctions, context: IUserDataStorageServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Storage Service.");
    this.CONTEXT = context;
  }

  public initialiseUserDataStorage(storageId: UUID): boolean {
    this.logger.debug(`Initialising User Data Storage "${storageId}".`);
    for (const AVAILABLE_SECURED_DATA_STORAGE_CONFIG of this.CONTEXT.getAvailableSecuredDataStorageConfigs()) {
      if (AVAILABLE_SECURED_DATA_STORAGE_CONFIG.storageId === storageId) {
        return this.CONTEXT.initialiseDataStoragesFromConfigs([AVAILABLE_SECURED_DATA_STORAGE_CONFIG]) === 1;
      }
    }
    throw new Error(`Unavailable User Data Storage Config "${storageId}"`);
  }

  public terminateUserDataStorage(storageId: UUID): boolean {
    this.logger.debug(`Terminating User Data Storage "${storageId}".`);
    return this.CONTEXT.terminateDataStoragesFromIds([storageId]) === 1;
  }

  public openUserDataStorage(storageId: UUID): boolean {
    this.logger.debug(`Opening User Data Storage "${storageId}".`);
    return this.CONTEXT.openInitialisedDataStorages([storageId]) === 1;
  }

  public closeUserDataStorage(storageId: UUID): boolean {
    this.logger.debug(`Closing User Data Storage "${storageId}".`);
    return this.CONTEXT.closeInitialisedDataStorages([storageId]) === 1;
  }

  public getAllSignedInUserInitialisedDataStoragesInfo(): IUserDataStorageInfo[] {
    this.logger.debug("Getting all signed in user's initialised User Data Storages Info.");
    return this.CONTEXT.getAllSignedInUserInitialisedDataStoragesInfo();
  }
}
