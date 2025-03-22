import { UUID } from "node:crypto";
import log, { LogFunctions } from "electron-log";
import { UserDataStorageBackend } from "./backend/UserDataStorageBackend";
import { IUserDataStorageConfig } from "./config/UserDataStorageConfig";
import { userDataStorageBackendFactory } from "./backend/userDataStorageBackendFactory";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { ISecuredUserDataStorageConfig } from "./config/SecuredUserDataStorageConfig";

export class UserDataStorage {
  private readonly logger: LogFunctions;
  public readonly storageId: UUID;
  public readonly userId: UUID;
  public readonly visibilityGroupId: UUID | null;
  public readonly name: string;
  public readonly description: string | null;
  private readonly backend: UserDataStorageBackend;

  public constructor(
    config: IUserDataStorageConfig | ISecuredUserDataStorageConfig,
    logScope: string,
    onInfoChanged: (newInfo: Readonly<IUserDataStorageInfo>) => void
  ) {
    this.logger = log.scope(logScope);
    this.logger.info(
      `Initialising User Data Storage "${config.name}" with ID "${config.storageId}" and backend type "${config.backendConfig.type}".`
    );
    this.storageId = config.storageId;
    this.userId = config.userId;
    this.visibilityGroupId = config.visibilityGroupId;
    this.name = config.name;
    this.description = config.description;
    const onBackendInfoChanged = (): void => {
      this.logger.info("Info changed.");
      onInfoChanged(this.getInfo());
    };
    this.backend = userDataStorageBackendFactory(config.backendConfig, `${logScope}-backend`, onBackendInfoChanged, this.logger);
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
}
