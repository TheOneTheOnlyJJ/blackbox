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
import { UserAccountStorageBackendInfo } from "@shared/user/account/storage/backend/info/UserAccountStorageBackendInfo";
import { userAccountStorageBackendConfigToUserAccountStorageBackendInfo } from "./backend/config/utils/userAccountStorageBackendConfigToUserAccountStorageBackendInfo";
import { IDataStorageConfigFilter, IDataStorageVisibilityGroupFilter } from "./backend/BaseUserAccountStorageBackend";

// TODO: Improve logging
export class UserAccountStorage {
  private readonly logger: LogFunctions;
  public readonly storageId: UUID;
  public readonly name: string;
  private readonly backend: UserAccountStorageBackend;
  public readonly backendInfo: UserAccountStorageBackendInfo; // TODO: get this dynamically from account storage?

  public constructor(config: IUserAccountStorageConfig, logScope: string) {
    this.logger = log.scope(logScope);
    this.logger.info(
      `Initialising User Account Storage "${config.name}" with ID "${config.storageId}" and backend type "${config.backendConfig.type}".`
    );
    this.storageId = config.storageId;
    this.name = config.name;
    this.backend = userAccountStorageBackendFactory(config.backendConfig, `${logScope}-backend`, this.logger);
    this.backendInfo = userAccountStorageBackendConfigToUserAccountStorageBackendInfo(config.backendConfig, this.logger);
  }

  public isOpen(): boolean {
    return this.backend.isOpen();
  }

  public isClosed(): boolean {
    return this.backend.isClosed();
  }

  public open(): boolean {
    this.logger.info(`Opening User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.open();
  }

  public close(): boolean {
    this.logger.info(`Closing User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.close();
  }

  public generateRandomUserId(): UUID {
    this.logger.info("Generating random user ID.");
    let userId: UUID = randomUUID({ disableEntropyCache: true });
    this.logger.debug(`Checking user ID "${userId}" availability.`);
    while (!this.isUserIdAvailable(userId)) {
      this.logger.debug(`User ID "${userId}" not available. Generating a new random one.`);
      userId = randomUUID({ disableEntropyCache: true });
    }
    this.logger.debug(`Generated random User ID "${userId}".`);
    return userId;
  }

  public generateRandomUserDataStorageId(): UUID {
    this.logger.debug("Generating random User Data Storage ID.");
    let storageId: UUID = randomUUID({ disableEntropyCache: true });
    this.logger.debug(`Checking User Data Storage ID "${storageId}" availability.`);
    while (!this.isUserDataStorageIdAvailable(storageId)) {
      this.logger.debug(`User Data Storage ID "${storageId}" not available. Generating a new random one.`);
      storageId = randomUUID({ disableEntropyCache: true });
    }
    this.logger.debug(`Generated random User Data Storage ID "${storageId}".`);
    return storageId;
  }

  public generateRandomUserDataStorageVisibilityGroupId(): UUID {
    this.logger.debug("Generating random User Data Storage Visibility Group ID.");
    let dataStorageVisibilityGroupId: UUID = randomUUID({ disableEntropyCache: true });
    this.logger.debug(`Checking User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}" availability.`);
    while (!this.isUserDataStorageVisibilityGroupIdAvailable(dataStorageVisibilityGroupId)) {
      this.logger.debug(`User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}" not available. Generating a new random one.`);
      dataStorageVisibilityGroupId = randomUUID({ disableEntropyCache: true });
    }
    this.logger.debug(`Generated random User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}".`);
    return dataStorageVisibilityGroupId;
  }

  public getInfo(): IUserAccountStorageInfo {
    this.logger.info("Getting User Account Storage Info.");
    return {
      storageId: this.storageId,
      name: this.name,
      backend: this.backendInfo,
      isOpen: this.isOpen()
    } satisfies IUserAccountStorageInfo;
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.info(`Checking if username "${username}" is available in User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.isUsernameAvailable(username);
  }

  public isUserIdAvailable(userId: UUID): boolean {
    this.logger.info(`Checking if user ID "${userId}" is available in User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.isUserIdAvailable(userId);
  }

  public isUserDataStorageIdAvailable(storageId: UUID): boolean {
    this.logger.info(
      `Checking if User Data Storage ID "${storageId}" is available in User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.isUserDataStorageIdAvailable(storageId);
  }

  public isUserDataStorageVisibilityGroupIdAvailable(dataStorageVisibilityGroupId: UUID): boolean {
    this.logger.info(
      `Checking if User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}" is available in User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.isUserDataStorageVisibilityGroupIdAvailable(dataStorageVisibilityGroupId);
  }

  public getUserCount(): number {
    this.logger.info(`Getting user count in User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    this.logger.info(`Getting username for user ID "${userId}" in User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.getUsernameForUserId(userId);
  }

  public addUser(securedUserSignUpPayload: ISecuredUserSignUpPayload): boolean {
    this.logger.info(`Adding user to User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.addUser(securedUserSignUpPayload);
  }

  public getUserId(username: string): UUID | null {
    this.logger.info(`Getting user ID for user "${username}" from User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.getUserId(username);
  }

  public getSecuredUserPassword(userId: UUID): ISecuredPassword | null {
    this.logger.info(
      `Getting secured user password for user with ID "${userId}" from User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.getSecuredUserPassword(userId);
  }

  public getUserDataEncryptionAESKeySalt(userId: UUID): string | null {
    this.logger.info(
      `Getting user data encryption AES key salt for user with ID "${userId}" from User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.getUserDataEncryptionAESKeySalt(userId);
  }

  public addStorageSecuredUserDataStorageConfig(storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): boolean {
    this.logger.info(
      `Adding Storage Secured User Data Storage Config to user with ID "${storageSecuredUserDataStorageConfig.userId}" to User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.addStorageSecuredUserDataStorageConfig(storageSecuredUserDataStorageConfig);
  }

  public addStorageSecuredUserDataStorageVisibilityGroupConfig(
    storageSecuredUserDataStorageVisibilityGroupConfig: IStorageSecuredUserDataStorageVisibilityGroupConfig
  ): boolean {
    this.logger.info(
      `Adding Storage Secured User Data Storage Visibility Group Config to user with ID "${storageSecuredUserDataStorageVisibilityGroupConfig.userId}" to User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.addStorageSecuredUserDataStorageVisibilityGroupConfig(storageSecuredUserDataStorageVisibilityGroupConfig);
  }

  public getStorageSecuredUserDataStorageVisibilityGroupConfigs(
    options: IDataStorageVisibilityGroupFilter
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig[] {
    this.logger.info(
      `Getting Storage Secured User Data Storage Visibility Groups Configs for user with ID "${options.userId}" from User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.getStorageSecuredUserDataStorageVisibilityGroupConfigs(options);
  }

  public getStorageSecuredUserDataStorageConfigs(options: IDataStorageConfigFilter): IStorageSecuredUserDataStorageConfig[] {
    this.logger.info(
      `Getting Storage Secured User Data Storage Configs for user with ID "${options.userId}" from User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.getStorageSecuredUserDataStorageConfigs(options);
  }

  public getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(
    userId: UUID,
    userDataStorageConfigId: UUID
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig | null {
    this.logger.info(
      `Getting Storage Secured User Data Storage Visibility Group Config for User Data Storage "${userDataStorageConfigId}" from User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(userId, userDataStorageConfigId);
  }
}
