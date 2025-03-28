import { LogFunctions } from "electron-log";
import { OnUserAccountStorageInfoChangedCallback, UserAccountStorage } from "../../account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { IUserAccountStorageConfig } from "@main/user/account/storage/config/UserAccountStorageConfig";
import { UUID } from "node:crypto";

export interface IUserAccountStorageServiceContext {
  isAccountStorageSet: () => boolean;
  isAccountStorageOpen: () => boolean;
  isAccountStorageClosed: () => boolean;
  getAccountStorageInfo: () => IUserAccountStorageInfo;
  setAccountStorage: (newAccountStorage: UserAccountStorage | null) => boolean;
  closeAccountStorage: () => boolean;
  openAccountStorage: () => boolean;
  getUserCount: () => number;
  getUsernameForUserId: (userId: UUID) => string | null;
}

export class UserAccountStorageService {
  private logger: LogFunctions;
  private readonly CONTEXT: IUserAccountStorageServiceContext;

  public constructor(logger: LogFunctions, context: IUserAccountStorageServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Account Storage Service.");
    this.CONTEXT = context;
  }

  public isAccountStorageOpen(): boolean {
    const IS_OPEN: boolean = this.CONTEXT.isAccountStorageOpen();
    this.logger.debug(`Getting User Account Storage open status: ${IS_OPEN.toString()}.`);
    return IS_OPEN;
  }

  public isAccountStorageClosed(): boolean {
    const IS_CLOSED: boolean = this.CONTEXT.isAccountStorageClosed();
    this.logger.debug(`Getting User Account Storage closed status: ${IS_CLOSED.toString()}.`);
    return IS_CLOSED;
  }

  public isAccountStorageSet(): boolean {
    const IS_SET: boolean = this.CONTEXT.isAccountStorageSet();
    this.logger.debug(`Getting User Account Storage set status: ${IS_SET.toString()}.`);
    return IS_SET;
  }

  public setAccountStorageFromConfig(
    newAccountStorageConfig: IUserAccountStorageConfig,
    logScope: string,
    onInfoChanged: OnUserAccountStorageInfoChangedCallback
  ): boolean {
    this.logger.debug(`Setting User Account Storage from Config "${newAccountStorageConfig.storageId}" ("${newAccountStorageConfig.name}").`);
    return this.setAccountStorage(new UserAccountStorage(newAccountStorageConfig, logScope, onInfoChanged));
  }

  public setAccountStorage(newAccountStorage: UserAccountStorage): boolean {
    this.logger.debug(`Setting User Account Storage "${newAccountStorage.storageId}" ("${newAccountStorage.name}").`);
    if (this.CONTEXT.isAccountStorageSet()) {
      const CURRENT_ACCOUNT_STORAGE_INFO: IUserAccountStorageInfo = this.CONTEXT.getAccountStorageInfo();
      if (CURRENT_ACCOUNT_STORAGE_INFO.storageId === newAccountStorage.storageId) {
        this.logger.warn("User Account Storage with same ID is already set. No-op.");
        return true;
      }
      this.logger.warn(`Already set "${CURRENT_ACCOUNT_STORAGE_INFO.name}" User Account Storage. Unsetting.`);
      this.unsetAccountStorage();
      if (this.isAccountStorageSet()) {
        this.logger.warn(`Could not unset previous "${CURRENT_ACCOUNT_STORAGE_INFO.name}" User Account Storage. No-op set.`);
        return false;
      }
    }
    return this.CONTEXT.setAccountStorage(newAccountStorage);
  }

  public unsetAccountStorage(): boolean {
    this.logger.debug("Unsetting User Account Storage.");
    if (this.isAccountStorageOpen()) {
      this.CONTEXT.closeAccountStorage();
    }
    return this.CONTEXT.setAccountStorage(null);
  }

  public openAccountStorage(): boolean {
    this.logger.debug("Opening User Account Storage.");
    return this.CONTEXT.openAccountStorage();
  }

  public closeAccountStorage(): boolean {
    this.logger.debug("Closing User Account Storage.");
    return this.CONTEXT.closeAccountStorage();
  }

  public getAccountStorageInfo(): IUserAccountStorageInfo {
    this.logger.debug("Getting User Account Storage info.");
    return this.CONTEXT.getAccountStorageInfo();
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    return this.CONTEXT.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    this.logger.debug(`Getting username for user ID "${userId}".`);
    return this.CONTEXT.getUsernameForUserId(userId);
  }
}
