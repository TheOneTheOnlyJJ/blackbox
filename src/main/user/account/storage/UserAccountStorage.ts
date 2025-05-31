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
import {
  IUserAccountStorageUserDataStorageConfigFilter,
  IUserAccountStorageUserDataStorageVisibilityGroupFilter,
  IUserAccountStorageBackendHandlers,
  ICheckUserDataStorageVisibilityGroupIdAvailabilityArgs,
  ICheckUserDataStorageIdAvailabilityArgs
} from "./backend/BaseUserAccountStorageBackend";

export interface IUserAccountStorageHandlers {
  onInfoChanged: ((newInfo: Readonly<IUserAccountStorageInfo>) => void) | null;
  onOpened: ((info: Readonly<IUserAccountStorageInfo>) => void) | null;
  onClosed: ((info: Readonly<IUserAccountStorageInfo>) => void) | null;
}

export class UserAccountStorage {
  private readonly logger: LogFunctions;
  public readonly storageId: UUID;
  public readonly name: string;
  private readonly backend: UserAccountStorageBackend;

  public constructor(config: IUserAccountStorageConfig, logScope: string, handlers: IUserAccountStorageHandlers) {
    this.logger = log.scope(logScope);
    this.logger.info(`Initialising "${config.backendConfig.type}" User Account Storage "${config.name}".`);
    this.storageId = config.storageId;
    this.name = config.name;
    this.backend = userAccountStorageBackendFactory(
      config.backendConfig,
      `${logScope}-bcknd`,
      {
        onInfoChanged: (): void => {
          this.logger.debug("Info changed.");
          handlers.onInfoChanged?.(this.getInfo());
        },
        onOpened: (): void => {
          handlers.onOpened?.(this.getInfo());
        },
        onClosed: (): void => {
          handlers.onClosed?.(this.getInfo());
        }
      } satisfies IUserAccountStorageBackendHandlers,
      this.logger
    );
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
    while (!this.isUserDataStorageIdAvailable({ storageId: storageId })) {
      this.logger.debug("Generating a new random ID.");
      storageId = randomUUID({ disableEntropyCache: true });
    }
    return storageId;
  }

  public generateRandomUserDataStorageVisibilityGroupId(): UUID {
    this.logger.debug("Generating random User Data Storage Visibility Group ID.");
    let dataStorageVisibilityGroupId: UUID = randomUUID({ disableEntropyCache: true });
    while (!this.isUserDataStorageVisibilityGroupIdAvailable({ visibilityGroupId: dataStorageVisibilityGroupId })) {
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

  public getConfig(): IUserAccountStorageConfig {
    this.logger.info("Getting User Account Storage Config.");
    return {
      storageId: this.storageId,
      name: this.name,
      backendConfig: this.backend.config
    } satisfies IUserAccountStorageConfig;
  }

  public isUsernameAvailable(username: string): boolean {
    return this.backend.isUsernameAvailable(username);
  }

  public isUserIdAvailable(userId: UUID): boolean {
    return this.backend.isUserIdAvailable(userId);
  }

  public isUserDataStorageIdAvailable(args: ICheckUserDataStorageIdAvailabilityArgs): boolean {
    return this.backend.isUserDataStorageIdAvailable(args);
  }

  public isUserDataStorageVisibilityGroupIdAvailable(args: ICheckUserDataStorageVisibilityGroupIdAvailabilityArgs): boolean {
    return this.backend.isUserDataStorageVisibilityGroupIdAvailable(args);
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
    filter: IUserAccountStorageUserDataStorageVisibilityGroupFilter
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig[] {
    return this.backend.getStorageSecuredUserDataStorageVisibilityGroupConfigs(filter);
  }

  public getStorageSecuredUserDataStorageConfigs(filter: IUserAccountStorageUserDataStorageConfigFilter): IStorageSecuredUserDataStorageConfig[] {
    return this.backend.getStorageSecuredUserDataStorageConfigs(filter);
  }

  public getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(
    userId: UUID,
    userDataStorageConfigId: UUID
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig | null {
    return this.backend.getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(userId, userDataStorageConfigId);
  }
}
