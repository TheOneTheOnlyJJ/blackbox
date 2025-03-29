import { ISecuredUserSignUpPayload } from "@main/user/account/SecuredUserSignUpPayload";
import { IDataStorageConfigFilter, IDataStorageVisibilityGroupFilter } from "@main/user/account/storage/backend/BaseUserAccountStorageBackend";
import { UserAccountStorage } from "@main/user/account/storage/UserAccountStorage";
import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/utils/securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/SecuredUserDataStorageVisibilityGroupConfig";
import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";
import { securedUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/utils/securedUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

const INITIAL_ACCOUNT_STORAGE: UserAccountStorage | null = null;

export class UserAccountStorageContext {
  private readonly logger: LogFunctions;

  private accountStorage: UserAccountStorage | null;

  public onAddedNewUserDataStorageConfigsCallback: ((newSecuredUserDataStorageConfigs: ISecuredUserDataStorageConfig[]) => void) | null;
  public onUserAccountStorageChangedCallback: ((newUserAccountStorage: UserAccountStorage | null) => void) | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new User Account Storage Context.");
    this.accountStorage = INITIAL_ACCOUNT_STORAGE;
    this.onAddedNewUserDataStorageConfigsCallback = null;
    this.onUserAccountStorageChangedCallback = null;
  }

  // TODO: ONLY ACCEPT SETTING FROM CONFIG, ADD onInfoChanged function here
  public set(newAccountStorage: UserAccountStorage | null): boolean {
    this.logger.info("Setting new User Account Storage.");
    if (newAccountStorage !== null && this.accountStorage !== null && newAccountStorage.storageId === this.accountStorage.storageId) {
      this.logger.info(`The same User Account Storage "${this.accountStorage.storageId}" is already set.`);
      return false;
    }
    let newAccountStorageInfo: IUserAccountStorageInfo | null;
    if (newAccountStorage === null) {
      newAccountStorageInfo = null;
    } else if (newAccountStorage instanceof UserAccountStorage) {
      newAccountStorageInfo = newAccountStorage.getInfo();
    } else {
      throw new Error(`Invalid new User Account Storage`);
    }
    if (this.accountStorage !== null) {
      this.accountStorage.close();
    }
    this.accountStorage = newAccountStorage;
    this.logger.info(
      `Set User Account Storage to: ${
        newAccountStorage === null ? "null (unavailable)" : `${JSON.stringify(newAccountStorageInfo, null, 2)} (available)`
      }`
    );
    this.onUserAccountStorageChangedCallback?.(newAccountStorage);
    return true;
  }

  public isSet(): boolean {
    return this.accountStorage !== null;
  }

  public open(): boolean {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.open();
  }

  public isOpen(): boolean {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.isOpen();
  }

  public close(): boolean {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.close();
  }

  public isClosed(): boolean {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.isClosed();
  }

  public getInfo(): IUserAccountStorageInfo {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.getInfo();
  }

  public getUserCount(): number {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.getUsernameForUserId(userId);
  }

  public getUserId(username: string): UUID | null {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.getUserId(username);
  }

  public getSecuredUserPassword(userId: UUID): ISecuredPassword | null {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.getSecuredUserPassword(userId);
  }

  public getUserDataAESKeySalt(userId: UUID): string | null {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.getUserDataAESKeySalt(userId);
  }

  public isUsernameAvailable(username: string): boolean {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.isUsernameAvailable(username);
  }

  public isUserIdAvailable(userId: UUID): boolean {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.isUserIdAvailable(userId);
  }

  public generateRandomUserId(): UUID {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.generateRandomUserId();
  }

  public generateRandomUserDataStorageId(): UUID {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.generateRandomUserDataStorageId();
  }

  public generateRandomUserDataStorageVisibilityGroupId(): UUID {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.generateRandomUserDataStorageVisibilityGroupId();
  }

  public addUser(securedUserSignUpPayload: ISecuredUserSignUpPayload): boolean {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.addUser(securedUserSignUpPayload);
  }

  public addSecuredUserDataStorageConfig(securedUserDataStorageConfig: ISecuredUserDataStorageConfig, encryptionAESKey: Buffer): boolean {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    const WAS_ADDED: boolean = this.accountStorage.addStorageSecuredUserDataStorageConfig(
      securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig(securedUserDataStorageConfig, encryptionAESKey, this.logger)
    );
    if (WAS_ADDED) {
      this.onAddedNewUserDataStorageConfigsCallback?.([securedUserDataStorageConfig]);
    }
    return WAS_ADDED;
  }

  public addSecuredUserDataStorageVisibilityGroupConfig(
    securedUserDataStorageVisibilityGroupConfig: ISecuredUserDataStorageVisibilityGroupConfig,
    encryptionAESKey: Buffer
  ): boolean {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.addStorageSecuredUserDataStorageVisibilityGroupConfig(
      securedUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig(
        securedUserDataStorageVisibilityGroupConfig,
        encryptionAESKey,
        this.logger
      )
    );
  }

  public getStorageSecuredUserDataStorageConfigs(options: IDataStorageConfigFilter): IStorageSecuredUserDataStorageConfig[] {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.getStorageSecuredUserDataStorageConfigs(options);
  }

  public getStorageSecuredUserDataStorageVisibilityGroupConfigs(
    options: IDataStorageVisibilityGroupFilter
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig[] {
    if (this.accountStorage === null) {
      throw new Error("Null User Account Storage");
    }
    return this.accountStorage.getStorageSecuredUserDataStorageVisibilityGroupConfigs(options);
  }
}
