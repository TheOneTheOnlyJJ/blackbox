import { randomUUID, UUID } from "node:crypto";
import log, { LogFunctions } from "electron-log";
import { UserDataStorageBackend } from "./backend/UserDataStorageBackend";
import { userDataStorageBackendFactory } from "./backend/userDataStorageBackendFactory";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { ISecuredUserDataStorageConfig } from "./config/SecuredUserDataStorageConfig";
import { IStorageSecuredUserDataBoxConfig } from "../box/config/StorageSecuredUserDataBoxConfig";
import { IUserDataStorageBackendHandlers } from "./backend/BaseUserDataStorageBackend";

export interface IUserDataStorageHandlers {
  onInfoChanged: ((newInfo: Readonly<IUserDataStorageInfo>) => void) | null;
  onOpened: ((info: Readonly<IUserDataStorageInfo>) => void) | null;
  onClosed: ((info: Readonly<IUserDataStorageInfo>) => void) | null;
}

export class UserDataStorage {
  private readonly logger: LogFunctions;
  public readonly storageId: UUID;
  public readonly userId: UUID;
  public readonly visibilityGroupId: UUID | null;
  public readonly name: string;
  public readonly description: string | null;
  private readonly backend: UserDataStorageBackend;

  public constructor(config: ISecuredUserDataStorageConfig, logScope: string, handlers: IUserDataStorageHandlers) {
    this.logger = log.scope(logScope);
    this.logger.info(
      `Initialising User Data Storage "${config.name}" with ID "${config.storageId}" and backend type "${config.backendConfig.type}".`
    );
    this.storageId = config.storageId;
    this.userId = config.userId;
    this.visibilityGroupId = config.visibilityGroupId;
    this.name = config.name;
    this.description = config.description;
    this.backend = userDataStorageBackendFactory(
      config.backendConfig,
      `${logScope}-bcknd`,
      {
        onInfoChanged: (): void => {
          this.logger.silly("Info changed.");
          handlers.onInfoChanged?.(this.getInfo());
        },
        onOpened: (): void => {
          handlers.onOpened?.(this.getInfo());
        },
        onClosed: (): void => {
          handlers.onClosed?.(this.getInfo());
        }
      } satisfies IUserDataStorageBackendHandlers,
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

  public generateRandomDataBoxId(): UUID {
    this.logger.debug("Generating random User Data Box ID.");
    let boxId: UUID = randomUUID({ disableEntropyCache: true });
    while (!this.isUserDataBoxIdAvailable(boxId)) {
      this.logger.debug("Generating a new random ID.");
      boxId = randomUUID({ disableEntropyCache: true });
    }
    return boxId;
  }

  public getInfo(): IUserDataStorageInfo {
    this.logger.info("Getting User Data Storage Info.");
    return {
      storageId: this.storageId,
      name: this.name,
      description: this.description,
      visibilityGroupId: this.visibilityGroupId,
      backend: this.backend.getInfo()
    } satisfies IUserDataStorageInfo;
  }

  public getConfig(): ISecuredUserDataStorageConfig {
    this.logger.info("Getting User Data Storage Config.");
    return {
      storageId: this.storageId,
      userId: this.userId,
      visibilityGroupId: this.visibilityGroupId,
      name: this.name,
      description: this.description,
      backendConfig: this.backend.config
    } satisfies ISecuredUserDataStorageConfig;
  }

  public isUserDataBoxIdAvailable(boxId: UUID): boolean {
    return this.backend.isUserDataBoxIdAvailable(boxId);
  }

  public addStorageSecuredUserDataBoxConfig(storageSecuredUserDataBoxConfig: IStorageSecuredUserDataBoxConfig): boolean {
    return this.backend.addStorageSecuredUserDataBoxConfig(storageSecuredUserDataBoxConfig);
  }

  public getStorageSecuredUserDataBoxConfigs(): IStorageSecuredUserDataBoxConfig[] {
    return this.backend.getStorageSecuredUserDataBoxConfigs(this.storageId);
  }
}
