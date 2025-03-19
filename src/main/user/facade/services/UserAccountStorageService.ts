import { LogFunctions } from "electron-log";
import { UserAccountStorage } from "../../account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { IUserAccountStorageProxy } from "../proxies/UserAccountStorageProxy";

export interface IUserAccountStorageServiceContext {
  accountStorage: IUserAccountStorageProxy;
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
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    const IS_OPEN: boolean = this.CONTEXT.accountStorage.value.isOpen();
    this.logger.debug(`Getting User Account Storage open status: ${IS_OPEN.toString()}.`);
    return IS_OPEN;
  }

  public isAccountStorageClosed(): boolean {
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    const IS_CLOSED: boolean = this.CONTEXT.accountStorage.value.isClosed();
    this.logger.debug(`Getting User Account Storage closed status: ${IS_CLOSED.toString()}.`);
    return IS_CLOSED;
  }

  public isAccountStorageSet(): boolean {
    const IS_AVAILABLE: boolean = this.CONTEXT.accountStorage.value !== null;
    this.logger.debug(`Getting User Account Storage set status: ${IS_AVAILABLE.toString()}.`);
    return IS_AVAILABLE;
  }

  public setAccountStorage(newAccountStorage: UserAccountStorage): boolean {
    this.logger.debug(`Setting "${newAccountStorage.name}" User Account Storage (ID "${newAccountStorage.storageId}").`);
    if (this.CONTEXT.accountStorage.value !== null) {
      if (this.CONTEXT.accountStorage.value.storageId === newAccountStorage.storageId) {
        this.logger.warn("User Account Storage with same ID is already set. No-op.");
        return true;
      }
      this.logger.warn(`Already set "${this.CONTEXT.accountStorage.value.name}" User Account Storage. Unsetting.`);
      this.unsetAccountStorage();
      if (this.isAccountStorageSet()) {
        this.logger.warn(`Could not unset previous "${this.CONTEXT.accountStorage.value.name}" User Account Storage. No-op set.`);
        return false;
      }
    }
    this.CONTEXT.accountStorage.value = newAccountStorage;
    return true;
  }

  public unsetAccountStorage(): boolean {
    this.logger.debug("Unsetting User Account Storage.");
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.isAccountStorageOpen() && !this.closeAccountStorage()) {
      this.logger.warn("No-op unset.");
      return false;
    }
    this.CONTEXT.accountStorage.value = null;
    this.logger.debug("Unset User Account Storage.");
    return true;
  }

  public openAccountStorage(): boolean {
    this.logger.debug("Opening User Account Storage.");
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.CONTEXT.accountStorage.value.open();
  }

  public closeAccountStorage(): boolean {
    this.logger.debug("Closing User Account Storage.");
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.CONTEXT.accountStorage.value.close();
  }

  public getAccountStorageInfo(): IUserAccountStorageInfo | null {
    if (this.CONTEXT.accountStorage.value === null) {
      return null;
    }
    return this.CONTEXT.accountStorage.value.getInfo();
  }
}
