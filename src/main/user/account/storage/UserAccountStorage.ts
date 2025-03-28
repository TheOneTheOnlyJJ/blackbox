import { randomUUID, UUID } from "node:crypto";
import { IUserAccountStorageConfig } from "./config/UserAccountStorageConfig";
import { userAccountStorageBackendFactory } from "./backend/userAccountStorageBackendFactory";
import log, { LogFunctions } from "electron-log";
import { UserAccountStorageBackend } from "./backend/UserAccountStorageBackend";
import { ISecuredUserSignUpPayload } from "../SecuredUserSignUpPayload";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";
import { IDataStorageConfigFilter, IDataStorageVisibilityGroupFilter } from "./backend/BaseUserAccountStorageBackend";

export type OnUserAccountStorageInfoChangedCallback = (newInfo: Readonly<IUserAccountStorageInfo>) => void;

export class UserAccountStorage {
  private readonly logger: LogFunctions;
  public readonly storageId: UUID;
  public readonly name: string;
  private readonly backend: UserAccountStorageBackend;

  public constructor(config: IUserAccountStorageConfig, logScope: string, onInfoChanged: OnUserAccountStorageInfoChangedCallback) {
    this.logger = log.scope(logScope);
    this.logger.info(`Initialising "${config.backendConfig.type}" User Account Storage "${config.name}".`);
    this.storageId = config.storageId;
    this.name = config.name;
    const onBackendInfoChanged = (): void => {
      this.logger.info("Info changed.");
      onInfoChanged(this.getInfo());
    };
    this.backend = userAccountStorageBackendFactory(config.backendConfig, `${logScope}-bcknd`, onBackendInfoChanged, this.logger);
  }

  public isOpen(): boolean {
    return this.backend.isOpen();
  }

  public isClosed(): boolean {
    return this.backend.isClosed();
  }

  public open(): boolean {
    return this.backend.open();
  }

  public close(): boolean {
    return this.backend.close();
  }

  public generateRandomUserId(): UUID {
    this.logger.info("Generating random user ID.");
    let userId: UUID = randomUUID({ disableEntropyCache: true });
    while (!this.isUserIdAvailable(userId)) {
      this.logger.debug("Generating a new random ID.");
      userId = randomUUID({ disableEntropyCache: true });
    }
    return userId;
  }

  public generateRandomUserDataStorageId(): UUID {
    this.logger.debug("Generating random User Data Storage ID.");
    let storageId: UUID = randomUUID({ disableEntropyCache: true });
    while (!this.isUserDataStorageIdAvailable(storageId)) {
      this.logger.debug("Generating a new random ID.");
      storageId = randomUUID({ disableEntropyCache: true });
    }
    return storageId;
  }

  public generateRandomUserDataStorageVisibilityGroupId(): UUID {
    this.logger.debug("Generating random User Data Storage Visibility Group ID.");
    let dataStorageVisibilityGroupId: UUID = randomUUID({ disableEntropyCache: true });
    while (!this.isUserDataStorageVisibilityGroupIdAvailable(dataStorageVisibilityGroupId)) {
      this.logger.debug("Generating a new random ID.");
      dataStorageVisibilityGroupId = randomUUID({ disableEntropyCache: true });
    }
    return dataStorageVisibilityGroupId;
  }

  public getInfo(): IUserAccountStorageInfo {
    this.logger.info("Getting User Account Storage Info.");
    return {
      storageId: this.storageId,
      name: this.name,
      backend: this.backend.getInfo()
    } satisfies IUserAccountStorageInfo;
  }

  public isUsernameAvailable(username: string): boolean {
    return this.backend.isUsernameAvailable(username);
  }

  public isUserIdAvailable(userId: UUID): boolean {
    return this.backend.isUserIdAvailable(userId);
  }

  public isUserDataStorageIdAvailable(storageId: UUID): boolean {
    return this.backend.isUserDataStorageIdAvailable(storageId);
  }

  public isUserDataStorageVisibilityGroupIdAvailable(dataStorageVisibilityGroupId: UUID): boolean {
    return this.backend.isUserDataStorageVisibilityGroupIdAvailable(dataStorageVisibilityGroupId);
  }

  public getUserCount(): number {
    return this.backend.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    return this.backend.getUsernameForUserId(userId);
  }

  public addUser(securedUserSignUpPayload: ISecuredUserSignUpPayload): boolean {
    return this.backend.addUser(securedUserSignUpPayload);
  }

  public getUserId(username: string): UUID | null {
    return this.backend.getUserId(username);
  }

  public getSecuredUserPassword(userId: UUID): ISecuredPassword | null {
    return this.backend.getSecuredUserPassword(userId);
  }

  public getUserDataAESKeySalt(userId: UUID): string | null {
    return this.backend.getUserDataAESKeySalt(userId);
  }

  public addStorageSecuredUserDataStorageConfig(storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): boolean {
    return this.backend.addStorageSecuredUserDataStorageConfig(storageSecuredUserDataStorageConfig);
  }

  public addStorageSecuredUserDataStorageVisibilityGroupConfig(
    storageSecuredUserDataStorageVisibilityGroupConfig: IStorageSecuredUserDataStorageVisibilityGroupConfig
  ): boolean {
    return this.backend.addStorageSecuredUserDataStorageVisibilityGroupConfig(storageSecuredUserDataStorageVisibilityGroupConfig);
  }

  public getStorageSecuredUserDataStorageVisibilityGroupConfigs(
    options: IDataStorageVisibilityGroupFilter
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig[] {
    return this.backend.getStorageSecuredUserDataStorageVisibilityGroupConfigs(options);
  }

  public getStorageSecuredUserDataStorageConfigs(options: IDataStorageConfigFilter): IStorageSecuredUserDataStorageConfig[] {
    return this.backend.getStorageSecuredUserDataStorageConfigs(options);
  }

  public getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(
    userId: UUID,
    userDataStorageConfigId: UUID
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig | null {
    return this.backend.getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(userId, userDataStorageConfigId);
  }
}
