import { UUID } from "node:crypto";
import { IUserAccountStorageConfig } from "./config/UserAccountStorageConfig";
import { userAccountStorageBackendFactory } from "./backend/userAccountStorageBackendFactory";
import { LogFunctions } from "electron-log";
import Ajv from "ajv";
import { UserAccountStorageBackend } from "./backend/UserAccountStorageBackend";
import { UserAccountStorageBackendType } from "./backend/UserAccountStorageBackendType";
import { UserAccountStorageOpenChangedCallback } from "@shared/IPC/APIs/UserAPI";
import { ISecuredUserSignUpPayload } from "../SecuredUserSignUpPayload";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";

export class UserAccountStorage {
  private readonly logger: LogFunctions;
  public readonly storageId: UUID;
  public readonly name: string;
  private readonly backend: UserAccountStorageBackend;
  public onUserAccountStorageOpenChangedCallback: UserAccountStorageOpenChangedCallback;

  public constructor(
    config: IUserAccountStorageConfig,
    logger: LogFunctions,
    backendLogger: LogFunctions,
    ajv: Ajv,
    onUserAccountStorageOpenChangedCallback?: UserAccountStorageOpenChangedCallback
  ) {
    this.logger = logger;
    this.logger.info(
      `Initialising User Account Storage "${config.name}" with ID "${config.storageId}" and backend type "${config.backendConfig.type}".`
    );
    this.storageId = config.storageId;
    this.name = config.name;
    this.backend = userAccountStorageBackendFactory(config.backendConfig, backendLogger, ajv);
    this.onUserAccountStorageOpenChangedCallback =
      onUserAccountStorageOpenChangedCallback ??
      ((): void => {
        this.logger.silly("No User Account Storage open status changed callback set.");
      });
  }

  public isOpen(): boolean {
    return this.backend.isOpen();
  }

  public open(): void {
    this.logger.info(`Opening User Account Storage "${this.name}" with ID "${this.storageId}".`);
    this.backend.open();
    this.onUserAccountStorageOpenChangedCallback(true);
  }

  public close(): void {
    this.logger.info(`Closing User Account Storage "${this.name}" with ID "${this.storageId}".`);
    this.backend.close();
    this.onUserAccountStorageOpenChangedCallback(false);
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

  public addUserDataStorageConfigToUser(userId: UUID, securedUserDataStorageConfig: ISecuredUserDataStorageConfig): boolean {
    this.logger.info(
      `Adding secured User Data Storage Config to user with ID "${userId}" to User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.addUserDataStorageConfigToUser(userId, securedUserDataStorageConfig);
  }

  public getAllUserDataStorageConfigs(userId: UUID): ISecuredUserDataStorageConfig[] {
    this.logger.info(
      `Getting all User Data Storage Configs for user with ID "${userId}" from User Account Storage "${this.name}" with ID "${this.storageId}".`
    );
    return this.backend.getAllUserDataStorageConfigs(userId);
  }
}
