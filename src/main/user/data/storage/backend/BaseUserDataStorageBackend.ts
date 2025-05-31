import log, { LogFunctions } from "electron-log";
import { ValidateFunction } from "ajv";
import { IBaseUserDataStorageBackendConfig } from "./config/BaseUserDataStorageBackendConfig";
import { IUserDataStorageBackendInfoMap } from "@shared/user/data/storage/backend/info/UserDataStorageBackendInfo";
import { deepFreeze } from "@main/utils/deepFreeze";
import { IStorageSecuredUserDataBoxConfig } from "../../box/config/StorageSecuredUserDataBoxConfig";
import { UUID } from "node:crypto";
import { IStorageSecuredUserDataTemplateConfig } from "../../template/config/StorageSecuredUserDataTemplateConfig";
import { IStorageSecuredUserDataEntry } from "../../entry/StorageSecuredUserDataEntry";

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

export interface IUserDataStorageUserDataEntryFilter {
  includeIds: UUID[] | "all";
  excludeIds: UUID[] | null;
  templates: {
    includeIds: UUID[] | "all";
    excludeIds: UUID[] | null;
  };
}

export interface ICheckUserDataBoxIdAvailabilityArgs {
  boxId: UUID;
}

export interface ICheckUserDataTemplateIdAvailabilityArgs {
  templateId: UUID;
  boxId: UUID;
}

export interface ICheckUserDataEntryIdAvailabilityArgs {
  entryId: UUID;
  templateId: UUID;
  boxId: UUID;
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
  public abstract isUserDataBoxIdAvailable(args: ICheckUserDataBoxIdAvailabilityArgs): boolean;
  public abstract isUserDataTemplateIdAvailable(args: ICheckUserDataTemplateIdAvailabilityArgs): boolean;
  public abstract isUserDataEntryIdAvailable(args: ICheckUserDataEntryIdAvailabilityArgs): boolean;
  public abstract addStorageSecuredUserDataBoxConfig(storageSecuredUserDataBoxConfig: IStorageSecuredUserDataBoxConfig): boolean;
  public abstract addStorageSecuredUserDataTemplateConfig(storageSecuredUserDataTemplateConfig: IStorageSecuredUserDataTemplateConfig): boolean;
  public abstract addStorageSecuredUserDataEntry(storageSecuredUserDataEntry: IStorageSecuredUserDataEntry): boolean;
  public abstract getStorageSecuredUserDataBoxConfigs(
    storageId: UUID, // Gets passed down from User Data Storage
    filter: IUserDataStorageUserDataBoxConfigFilter
  ): IStorageSecuredUserDataBoxConfig[];
  public abstract getStorageSecuredUserDataTemplateConfigs(
    storageId: UUID, // Gets passed down from User Data Storage
    filter: IUserDataStorageUserDataTemplateConfigFilter
  ): IStorageSecuredUserDataTemplateConfig[];
  public abstract getStorageSecuredUserDataEntries(
    storageId: UUID, // Gets passed down from User Data Storage
    filter: IUserDataStorageUserDataEntryFilter
  ): IStorageSecuredUserDataEntry[];

  public getInfo(): Readonly<IUserDataStorageBackendInfoMap[T["type"]]> {
    return this.info;
  }

  protected updateInfo(newInfo: IUserDataStorageBackendInfoMap[T["type"]]): void {
    this.info = deepFreeze<IUserDataStorageBackendInfoMap[T["type"]]>(newInfo);
    this.onInfoChanged?.();
  }
}
