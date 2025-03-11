import { UUID } from "node:crypto";
import { IUserAccountStorageConfig } from "./config/UserAccountStorageConfig";
import { userAccountStorageBackendFactory } from "./backend/userAccountStorageBackendFactory";
import { LogFunctions } from "electron-log";
import { UserAccountStorageBackend } from "./backend/UserAccountStorageBackend";
import { UserAccountStorageBackendType } from "./backend/UserAccountStorageBackendType";
import { ISecuredUserSignUpPayload } from "../SecuredUserSignUpPayload";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IPublicUserAccountStorageConfig } from "@shared/user/account/storage/PublicUserAccountStorageConfig";
import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";

export class UserAccountStorage {
  private readonly logger: LogFunctions;
  public readonly storageId: UUID;
  public readonly name: string;
  private readonly backend: UserAccountStorageBackend;

  public constructor(config: IUserAccountStorageConfig, logger: LogFunctions, backendLogger: LogFunctions) {
    this.logger = logger;
    this.logger.info(
      `Initialising User Account Storage "${config.name}" with ID "${config.storageId}" and backend type "${config.backendConfig.type}".`
    );
    this.storageId = config.storageId;
    this.name = config.name;
    this.backend = userAccountStorageBackendFactory(config.backendConfig, backendLogger);
  }

  public isOpen(): boolean {
    return this.backend.isOpen();
  }

  public open(): boolean {
    this.logger.info(`Opening User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.open();
  }

  public close(): boolean {
    this.logger.info(`Closing User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.close();
  }

  public getPublicUserAccountStorageConfig(): IPublicUserAccountStorageConfig {
    this.logger.info("Getting Public User Account Storage Config.");
    return {
      storageId: this.storageId,
      name: this.name,
      isOpen: this.isOpen()
    } satisfies IPublicUserAccountStorageConfig;
  }

  public getBackendType(): UserAccountStorageBackendType {
    this.logger.info(`Getting User Account Storage "${this.name}" with ID "${this.storageId}" backend type.`);
    return this.backend.config.type;
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

  public getUserCount(): number {
    this.logger.info(`Getting user count in User Account Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.getUserCount();
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

  public getAllStorageSecuredUserDataStorageConfigs(userId: UUID): IStorageSecuredUserDataStorageConfig[] {
    this.logger.info(
      `Getting all Storage Secured User Data Storage Configs for user with ID "${userId}" from User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.getAllStorageSecuredUserDataStorageConfigs(userId);
  }
}
