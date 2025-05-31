import log, { LogFunctions } from "electron-log";
import { ValidateFunction } from "ajv";
import { ISecuredUserSignUpPayload } from "../../SecuredUserSignUpPayload";
import { UUID } from "node:crypto";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IBaseUserAccountStorageBackendConfig } from "./config/BaseUserAccountStorageBackendConfig";
import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";
import { IUserAccountStorageBackendInfoMap } from "@shared/user/account/storage/backend/info/UserAccountStorageBackendInfo";
import { deepFreeze } from "@main/utils/deepFreeze";

// TODO: Should these be Identifier objects?
export interface IUserAccountStorageUserDataStorageConfigFilter {
  userId: UUID;
  includeIds: UUID[] | "all";
  excludeIds: UUID[] | null;
  visibilityGroups: {
    includeIds: (UUID | null)[] | "all";
    excludeIds: UUID[] | null;
  };
}

// TODO: Identifier here?
export interface IUserAccountStorageUserDataStorageVisibilityGroupFilter {
  userId: UUID;
  includeIds: UUID[] | "all";
  excludeIds: UUID[] | null;
}

export interface ICheckUserDataStorageIdAvailabilityArgs {
  storageId: UUID;
}

export interface ICheckUserDataStorageVisibilityGroupIdAvailabilityArgs {
  visibilityGroupId: UUID;
}

export interface IUserAccountStorageBackendHandlers {
  onInfoChanged: (() => void) | null;
  onOpened: (() => void) | null;
  onClosed: (() => void) | null;
}

export abstract class BaseUserAccountStorageBackend<T extends IBaseUserAccountStorageBackendConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  private info: Readonly<IUserAccountStorageBackendInfoMap[T["type"]]>;
  private readonly onInfoChanged: (() => void) | null;
  protected readonly onOpened: (() => void) | null;
  protected readonly onClosed: (() => void) | null;

  public constructor(
    config: T,
    initialInfo: IUserAccountStorageBackendInfoMap[T["type"]],
    logScope: string,
    handlers: IUserAccountStorageBackendHandlers
  ) {
    this.logger = log.scope(logScope);
    this.config = config;
    this.logger.info(`Initialising ${this.config.type} User Acount Storage Backend with info: ${JSON.stringify(initialInfo, null, 2)}.`);
    this.info = deepFreeze<IUserAccountStorageBackendInfoMap[T["type"]]>(initialInfo);
    this.onInfoChanged = handlers.onInfoChanged;
    this.onOpened = handlers.onOpened;
    this.onClosed = handlers.onClosed;
  }

  public static isValidConfig<T extends IBaseUserAccountStorageBackendConfig>(data: unknown, isValidConcreteConfig: ValidateFunction<T>): data is T {
    if (isValidConcreteConfig(data)) {
      return true;
    }
    return false;
  }

  public abstract open(): boolean;
  public abstract close(): boolean;
  public abstract isOpen(): boolean;
  public abstract isClosed(): boolean;
  public abstract isUserIdAvailable(userId: UUID): boolean;
  public abstract isUsernameAvailable(username: string): boolean;
  public abstract addUser(securedUserSignInPayload: ISecuredUserSignUpPayload): boolean;
  public abstract getUserId(username: string): UUID | null;
  public abstract getSecuredUserPassword(userId: UUID): ISecuredPassword | null;
  public abstract getUserDataAESKeySalt(userId: UUID): string | null;
  public abstract getUserCount(): number;
  public abstract getUsernameForUserId(userId: UUID): string | null;
  public abstract isUserDataStorageIdAvailable(args: ICheckUserDataStorageIdAvailabilityArgs): boolean;
  public abstract isUserDataStorageVisibilityGroupIdAvailable(args: ICheckUserDataStorageVisibilityGroupIdAvailabilityArgs): boolean;
  public abstract addStorageSecuredUserDataStorageConfig(storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): boolean;
  public abstract addStorageSecuredUserDataStorageVisibilityGroupConfig(
    storageSecuredUserDataStorageVisibilityGroupConfig: IStorageSecuredUserDataStorageVisibilityGroupConfig
  ): boolean;
  public abstract getStorageSecuredUserDataStorageConfigs(
    filter: IUserAccountStorageUserDataStorageConfigFilter
  ): IStorageSecuredUserDataStorageConfig[];
  public abstract getStorageSecuredUserDataStorageVisibilityGroupConfigs(
    filter: IUserAccountStorageUserDataStorageVisibilityGroupFilter
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig[];
  public abstract getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(
    userId: UUID,
    userDataStorageConfigId: UUID
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig | null;

  public getInfo(): Readonly<IUserAccountStorageBackendInfoMap[T["type"]]> {
    return this.info;
  }

  protected updateInfo(newInfo: IUserAccountStorageBackendInfoMap[T["type"]]): void {
    this.info = deepFreeze<IUserAccountStorageBackendInfoMap[T["type"]]>(newInfo);
    this.onInfoChanged?.();
  }
}
