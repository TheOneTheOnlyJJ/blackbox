import log, { LogFunctions } from "electron-log";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { ISecuredUserSignUpPayload } from "../../SecuredUserSignUpPayload";
import { UUID } from "node:crypto";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IBaseUserAccountStorageBackendConfig } from "./config/BaseUserAccountStorageBackendConfig";
import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";

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
  private readonly USER_ACCOUNT_STORAGE_BACKEND_CONFIG_VALIDATE_FUNCTION: ValidateFunction<T>;

  public constructor(config: T, configSchema: JSONSchemaType<T>, logScope: string) {
    this.logger = log.scope(logScope);
    this.logger.info("Initialising User Acount Storage Backend.");
    this.config = config;
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.USER_ACCOUNT_STORAGE_BACKEND_CONFIG_VALIDATE_FUNCTION = AJV.compile<T>(configSchema);
    if (!this.isConfigValid()) {
      throw new Error(`Could not initialise User Acount Storage Backend`);
    }
  }

  public abstract open(): boolean;
  public abstract close(): boolean;
  public abstract isOpen(): boolean;
  public abstract isClosed(): boolean;
  public abstract isLocal(): boolean;
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

  private isConfigValid(): boolean {
    this.logger.debug("Validating User Acount Storage Backend Config.");
    if (this.USER_ACCOUNT_STORAGE_BACKEND_CONFIG_VALIDATE_FUNCTION(this.config)) {
      this.logger.debug(`Valid "${this.config.type}" User Account Storage Backend Config.`);
      return true;
    }
    this.logger.debug("Invalid User Account Storage Backend Config.");
    this.logger.error("Validation errors:");
    this.USER_ACCOUNT_STORAGE_BACKEND_CONFIG_VALIDATE_FUNCTION.errors?.map((error): void => {
      this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
    });
    return false;
  }
}
