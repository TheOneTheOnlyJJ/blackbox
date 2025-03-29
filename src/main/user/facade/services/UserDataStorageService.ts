import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { UserDataStorage } from "@main/user/data/storage/UserDataStorage";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IUserDataStorageServiceContext {
  getInitialisedDataStorages: () => UserDataStorage[];
  initialiseDataStoragesFromConfigs: (newSecuredDataStorageConfigs: IUserDataStorageConfig[]) => number;
  terminateDataStoragesFromIds: (dataStorageIds: UUID[]) => number;
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
    // TODO: THESE CHECKS SHOULD BE DONE INSIDE CONTEXT
    const AVAILABLE_DATA_STORAGES: UserDataStorage[] = this.CONTEXT.getInitialisedDataStorages();
    for (const AVAILABLE_DATA_STORAGE of AVAILABLE_DATA_STORAGES) {
      if (AVAILABLE_DATA_STORAGE.storageId === storageId) {
        return AVAILABLE_DATA_STORAGE.open();
      }
    }
    throw new Error(`Unavailable User Data Storage "${storageId}"`);
  }

  public closeUserDataStorage(storageId: UUID): boolean {
    this.logger.debug(`Closing User Data Storage "${storageId}".`);
    // TODO: THESE CHECKS SHOULD BE DONE INSIDE CONTEXT
    const AVAILABLE_DATA_STORAGES: UserDataStorage[] = this.CONTEXT.getInitialisedDataStorages();
    for (const AVAILABLE_DATA_STORAGE of AVAILABLE_DATA_STORAGES) {
      if (AVAILABLE_DATA_STORAGE.storageId === storageId) {
        return AVAILABLE_DATA_STORAGE.close();
      }
    }
    throw new Error(`Unavailable User Data Storage "${storageId}"`);
  }

  public getAllSignedInUserInitialisedDataStoragesInfo(): IUserDataStorageInfo[] {
    this.logger.debug("Getting all signed in user's initialised User Data Storages Info.");
    return this.CONTEXT.getInitialisedDataStorages().map((dataStorage: UserDataStorage): IUserDataStorageInfo => {
      return dataStorage.getInfo();
    });
  }
}
