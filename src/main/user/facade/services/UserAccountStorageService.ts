import { LogFunctions } from "electron-log";
import { OnUserAccountStorageInfoChangedCallback, UserAccountStorage } from "../../account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { IUserAccountStorageConfig } from "@main/user/account/storage/config/UserAccountStorageConfig";
import { UUID } from "node:crypto";

export interface IUserAccountStorageServiceContext {
  getAccountStorage: () => UserAccountStorage | null;
  setAccountStorage: (newAccountStorage: UserAccountStorage | null) => boolean;
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
    return this.CONTEXT.setAccountStorage(newAccountStorage);
  }

  public unsetAccountStorage(): boolean {
    this.logger.debug("Unsetting User Account Storage.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    if (this.isAccountStorageOpen()) {
      ACCOUNT_STORAGE.close();
    }
    return this.CONTEXT.setAccountStorage(null);
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

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    return ACCOUNT_STORAGE.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    this.logger.debug(`Getting username for user ID "${userId}".`);
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    return ACCOUNT_STORAGE.getUsernameForUserId(userId);
  }
}
