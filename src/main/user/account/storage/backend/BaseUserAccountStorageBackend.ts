import log, { LogFunctions } from "electron-log";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { ISecuredUserSignUpPayload } from "../../SecuredUserSignUpPayload";
import { UUID } from "node:crypto";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IBaseUserAccountStorageBackendConfig } from "./config/BaseUserAccountStorageBackendConfig";
import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";
import { IUserAccountStorageBackendInfoMap } from "@shared/user/account/storage/backend/info/UserAccountStorageBackendInfo";
import { deepFreeze } from "@main/utils/deepFreeze";

export interface IDataStorageConfigFilter {
  userId: UUID;
  includeIds: UUID[] | "all";
  excludeIds: UUID[] | null;
  visibilityGroups: {
    includeIds: (UUID | null)[] | "all";
    excludeIds: UUID[] | null;
  };
}

export interface IDataStorageVisibilityGroupFilter {
  userId: UUID;
  includeIds: UUID[] | "all";
  excludeIds: UUID[] | null;
}

export abstract class BaseUserAccountStorageBackend<T extends IBaseUserAccountStorageBackendConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  private info: Readonly<IUserAccountStorageBackendInfoMap[T["type"]]>;
  private onInfoChanged: () => void;

  public constructor(
    config: T,
    configSchema: JSONSchemaType<T>,
    initialInfo: IUserAccountStorageBackendInfoMap[T["type"]],
    onInfoChanged: (newInfo: Readonly<IUserAccountStorageBackendInfoMap[T["type"]]>) => void,
    logScope: string
  ) {
    // TODO: Move this higher?
    this.logger = log.scope(logScope);
    if (!this.isValidConfig(config, AJV.compile<T>(configSchema))) {
      throw new Error(`Could not initialise User Acount Storage Backend`);
    }
    this.config = config;
    this.logger.info(`Initialising ${this.config.type} User Acount Storage Backend with info: ${JSON.stringify(initialInfo, null, 2)}.`);
    this.info = deepFreeze<IUserAccountStorageBackendInfoMap[T["type"]]>(initialInfo);
    this.onInfoChanged = (): void => {
      onInfoChanged(this.info);
    };
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
  public abstract isUserDataStorageIdAvailable(storageId: UUID): boolean;
  public abstract isUserDataStorageVisibilityGroupIdAvailable(dataStorageVisibilityGroupId: UUID): boolean;
  public abstract addStorageSecuredUserDataStorageConfig(storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): boolean;
  public abstract addStorageSecuredUserDataStorageVisibilityGroupConfig(
    storageSecuredUserDataStorageVisibilityGroupConfig: IStorageSecuredUserDataStorageVisibilityGroupConfig
  ): boolean;
  public abstract getStorageSecuredUserDataStorageConfigs(filter: IDataStorageConfigFilter): IStorageSecuredUserDataStorageConfig[];
  public abstract getStorageSecuredUserDataStorageVisibilityGroupConfigs(
    filter: IDataStorageVisibilityGroupFilter
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig[];
  public abstract getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(
    userId: UUID,
    userDataStorageConfigId: UUID
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig | null;

  private isValidConfig(data: unknown, validateFunction: ValidateFunction<T>): data is T {
    this.logger.debug("Validating User Acount Storage Backend Config.");
    if (validateFunction(data)) {
      return true;
    }
    this.logger.debug("Invalid User Account Storage Backend Config.");
    this.logger.error("Validation errors:");
    validateFunction.errors?.map((error): void => {
      this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
    });
    return false;
  }

  public getInfo(): Readonly<IUserAccountStorageBackendInfoMap[T["type"]]> {
    return this.info;
  }

  protected updateInfo(newInfo: IUserAccountStorageBackendInfoMap[T["type"]]): void {
    this.info = deepFreeze<IUserAccountStorageBackendInfoMap[T["type"]]>(newInfo);
    this.onInfoChanged();
  }
}
