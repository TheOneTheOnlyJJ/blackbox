import log, { LogFunctions } from "electron-log";
import { ValidateFunction } from "ajv";
import { IBaseUserDataStorageBackendConfig } from "./config/BaseUserDataStorageBackendConfig";
import { IUserDataStorageBackendInfoMap } from "@shared/user/data/storage/backend/info/UserDataStorageBackendInfo";
import { deepFreeze } from "@main/utils/deepFreeze";
import { IStorageSecuredUserDataBoxConfig } from "../../box/config/StorageSecuredUserDataBoxConfig";
import { UUID } from "node:crypto";
import { IStorageSecuredUserDataTemplateConfig } from "../../template/config/StorageSecuredUserDataTemplateConfig";

export interface IUserDataStorageUserDataBoxConfigFilter {
  includeIds: UUID[] | "all";
  excludeIds: UUID[] | null;
}

export interface IUserDataStorageUserDataTemplateConfigFilter {
  includeIds: UUID[] | "all";
  excludeIds: UUID[] | null;
  boxes: {
    includeIds: UUID[] | "all";
    excludeIds: UUID[] | null;
  };
}

export interface IUserDataStorageBackendHandlers {
  onInfoChanged: (() => void) | null;
  onOpened: (() => void) | null;
  onClosed: (() => void) | null;
}

export abstract class BaseUserDataStorageBackend<T extends IBaseUserDataStorageBackendConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  private info: Readonly<IUserDataStorageBackendInfoMap[T["type"]]>;
  private readonly onInfoChanged: (() => void) | null;
  protected readonly onOpened: (() => void) | null;
  protected readonly onClosed: (() => void) | null;

  public constructor(config: T, initialInfo: IUserDataStorageBackendInfoMap[T["type"]], logScope: string, handlers: IUserDataStorageBackendHandlers) {
    this.logger = log.scope(logScope);
    this.config = config;
    this.logger.info(`Initialising ${this.config.type} User Data Storage Backend with info: ${JSON.stringify(initialInfo, null, 2)}.`);
    this.info = deepFreeze<IUserDataStorageBackendInfoMap[T["type"]]>(initialInfo);
    this.onInfoChanged = handlers.onInfoChanged;
    this.onOpened = handlers.onOpened;
    this.onClosed = handlers.onClosed;
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
  // TODO: These should accept Identifier objects as arguments for complete ID availability checks
  public abstract isUserDataBoxIdAvailable(boxId: UUID): boolean;
  // TODO: For example boxId is useless until now but some storages may allow the same template ID in different boxes
  public abstract isUserDataTemplateIdAvailable(templateId: UUID, boxId: UUID): boolean;
  public abstract addStorageSecuredUserDataBoxConfig(storageSecuredUserDataBoxConfig: IStorageSecuredUserDataBoxConfig): boolean;
  public abstract addStorageSecuredUserDataTemplateConfig(storageSecuredUserDataTemplateConfig: IStorageSecuredUserDataTemplateConfig): boolean;
  public abstract getStorageSecuredUserDataBoxConfigs(
    storageId: UUID, // Gets passed down from User Data Storage
    filter: IUserDataStorageUserDataBoxConfigFilter
  ): IStorageSecuredUserDataBoxConfig[];
  public abstract getStorageSecuredUserDataTemplateConfigs(
    storageId: UUID, // Gets passed down from User Data Storage
    filter: IUserDataStorageUserDataTemplateConfigFilter
  ): IStorageSecuredUserDataTemplateConfig[];

  public getInfo(): Readonly<IUserDataStorageBackendInfoMap[T["type"]]> {
    return this.info;
  }

  protected updateInfo(newInfo: IUserDataStorageBackendInfoMap[T["type"]]): void {
    this.info = deepFreeze<IUserDataStorageBackendInfoMap[T["type"]]>(newInfo);
    this.onInfoChanged?.();
  }
}
