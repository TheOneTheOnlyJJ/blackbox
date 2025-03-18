import { UUID } from "node:crypto";
import { LogFunctions } from "electron-log";
import { UserDataStorageBackend } from "./backend/UserDataStorageBackend";
import { UserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/UserDataStorageBackendInfo";
import { IUserDataStorageConfig } from "./config/UserDataStorageConfig";
import { userDataStorageBackendFactory } from "./backend/userDataStorageBackendFactory";
import { userDataStorageBackendConfigToUserDataStorageBackendInfo } from "./backend/config/utils/userDataStorageBackendConfigToUserDataStorageBackendInfo";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";

// TODO: Improve logging
export class UserDataStorage {
  private readonly logger: LogFunctions;
  public readonly storageId: UUID;
  public readonly userId: UUID;
  public readonly visibilityGroupId: UUID | null;
  public readonly name: string;
  public readonly description: string | null;
  private readonly backend: UserDataStorageBackend;
  public readonly visibilityGroupName: string | null;
  public readonly backendInfo: UserDataStorageBackendInfo; // TODO: get this dynamically from data storage

  public constructor(config: IUserDataStorageConfig, visibilityGroupName: string | null, logger: LogFunctions, backendLogger: LogFunctions) {
    this.logger = logger;
    this.logger.info(
      `Initialising User Data Storage "${config.name}" with ID "${config.storageId}" and backend type "${config.backendConfig.type}".`
    );
    this.storageId = config.storageId;
    this.userId = config.userId;
    this.visibilityGroupId = config.visibilityGroupId;
    this.name = config.name;
    this.description = config.description;
    this.backend = userDataStorageBackendFactory(config.backendConfig, backendLogger);
    this.visibilityGroupName = visibilityGroupName;
    this.backendInfo = userDataStorageBackendConfigToUserDataStorageBackendInfo(config.backendConfig, this.logger);
  }

  public isOpen(): boolean {
    return this.backend.isOpen();
  }

  public isClosed(): boolean {
    return this.backend.isClosed();
  }

  public open(): boolean {
    this.logger.info(`Opening User Data Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.open();
  }

  public close(): boolean {
    this.logger.info(`Closing User Data Storage "${this.name}" with ID "${this.storageId}".`);
    return this.backend.close();
  }

  public getInfo(): IUserDataStorageInfo {
    this.logger.info("Getting User Data Storage Info.");
    return {
      storageId: this.storageId,
      name: this.name,
      description: this.description,
      visibilityGroupName: this.visibilityGroupName, // TODO: Move this higher up?
      backend: this.backendInfo,
      isOpen: this.isOpen()
    } satisfies IUserDataStorageInfo;
  }
}
