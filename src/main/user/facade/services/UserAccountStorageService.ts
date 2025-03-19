import { LogFunctions } from "electron-log";
import { UserAccountStorage } from "../../account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";

export interface IUserAccountStorageServiceContext {
  getAccountStorage: () => UserAccountStorage | null;
  setAccountStorage: (newAccountStorage: UserAccountStorage | null) => void;
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
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    const IS_OPEN: boolean = ACCOUNT_STORAGE.isOpen();
    this.logger.debug(`Getting User Account Storage open status: ${IS_OPEN.toString()}.`);
    return IS_OPEN;
  }

  public isAccountStorageClosed(): boolean {
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    const IS_CLOSED: boolean = ACCOUNT_STORAGE.isClosed();
    this.logger.debug(`Getting User Account Storage closed status: ${IS_CLOSED.toString()}.`);
    return IS_CLOSED;
  }

  public isAccountStorageSet(): boolean {
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    const IS_AVAILABLE: boolean = ACCOUNT_STORAGE !== null;
    this.logger.debug(`Getting User Account Storage set status: ${IS_AVAILABLE.toString()}.`);
    return IS_AVAILABLE;
  }

  // TODO: Take only the config as a parameter and initialise the account storage here
  public setAccountStorage(newAccountStorage: UserAccountStorage): boolean {
    this.logger.debug(`Setting "${newAccountStorage.name}" User Account Storage (ID "${newAccountStorage.storageId}").`);
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE !== null) {
      if (ACCOUNT_STORAGE.storageId === newAccountStorage.storageId) {
        this.logger.warn("User Account Storage with same ID is already set. No-op.");
        return true;
      }
      this.logger.warn(`Already set "${ACCOUNT_STORAGE.name}" User Account Storage. Unsetting.`);
      this.unsetAccountStorage();
      if (this.isAccountStorageSet()) {
        this.logger.warn(`Could not unset previous "${ACCOUNT_STORAGE.name}" User Account Storage. No-op set.`);
        return false;
      }
    }
    this.CONTEXT.setAccountStorage(newAccountStorage);
    return true;
  }

  public unsetAccountStorage(): boolean {
    this.logger.debug("Unsetting User Account Storage.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.isAccountStorageOpen() && !this.closeAccountStorage()) {
      this.logger.warn("No-op unset.");
      return false;
    }
    this.CONTEXT.setAccountStorage(null);
    this.logger.debug("Unset User Account Storage.");
    return true;
  }

  public openAccountStorage(): boolean {
    this.logger.debug("Opening User Account Storage.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    return ACCOUNT_STORAGE.open();
  }

  public closeAccountStorage(): boolean {
    this.logger.debug("Closing User Account Storage.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    return ACCOUNT_STORAGE.close();
  }

  public getAccountStorageInfo(): IUserAccountStorageInfo | null {
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      return null;
    }
    return ACCOUNT_STORAGE.getInfo();
  }
}
