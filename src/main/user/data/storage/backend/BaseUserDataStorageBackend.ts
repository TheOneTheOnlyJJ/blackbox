import log, { LogFunctions } from "electron-log";
import { ValidateFunction } from "ajv";
import { IBaseUserDataStorageBackendConfig } from "./config/BaseUserDataStorageBackendConfig";
import { IUserDataStorageBackendInfoMap } from "@shared/user/data/storage/backend/info/UserDataStorageBackendInfo";
import { deepFreeze } from "@main/utils/deepFreeze";
import { IStorageSecuredUserDataBoxConfig } from "../../box/config/StorageSecuredUserDataBoxConfig";
import { UUID } from "node:crypto";

export abstract class BaseUserDataStorageBackend<T extends IBaseUserDataStorageBackendConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  private info: Readonly<IUserDataStorageBackendInfoMap[T["type"]]>;
  private onInfoChanged: () => void;

  public constructor(
    config: T,
    initialInfo: IUserDataStorageBackendInfoMap[T["type"]],
    logScope: string,
    onInfoChanged: (newInfo: Readonly<IUserDataStorageBackendInfoMap[T["type"]]>) => void
  ) {
    this.logger = log.scope(logScope);
    this.config = config;
    this.logger.info(`Initialising ${this.config.type} User Data Storage Backend with info: ${JSON.stringify(initialInfo, null, 2)}.`);
    this.info = deepFreeze<IUserDataStorageBackendInfoMap[T["type"]]>(initialInfo);
    this.onInfoChanged = (): void => {
      onInfoChanged(this.info);
    };
  }

  public static isValidConfig<T extends IBaseUserDataStorageBackendConfig>(data: unknown, validateFunction: ValidateFunction<T>): data is T {
    if (validateFunction(data)) {
      return true;
    }
    return false;
  }

  public abstract open(): boolean;
  public abstract close(): boolean;
  public abstract isOpen(): boolean;
  public abstract isClosed(): boolean;
  public abstract isLocal(): boolean;
  public abstract isUserDataBoxIdAvailable(boxId: UUID): boolean;
  public abstract addStorageSecuredUserDataBoxConfig(storageSecuredUserDataBoxConfig: IStorageSecuredUserDataBoxConfig): boolean;
  public abstract getStorageSecuredUserDataBoxConfigs(
    storageId: UUID // Gets passed down from User Data Storage
  ): IStorageSecuredUserDataBoxConfig[];

  public getInfo(): Readonly<IUserDataStorageBackendInfoMap[T["type"]]> {
    return this.info;
  }

  protected updateInfo(newInfo: IUserDataStorageBackendInfoMap[T["type"]]): void {
    this.info = deepFreeze<IUserDataStorageBackendInfoMap[T["type"]]>(newInfo);
    this.onInfoChanged();
  }
}
