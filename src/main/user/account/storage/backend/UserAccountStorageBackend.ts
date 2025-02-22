import { LogFunctions } from "electron-log";
import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import { ISecuredUserSignUpPayload } from "../../SecuredUserSignUpPayload";
import { UUID } from "node:crypto";
import {
  ISecuredUserDataStorageConfig,
  SECURED_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA
} from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { ISecuredPasswordData } from "@main/utils/encryption/SecuredPasswordData";
import { IBaseUserAccountStorageBackendConfig } from "./config/BaseUserAccountStorageBackendConfig";

export abstract class UserAccountStorageBackend<T extends IBaseUserAccountStorageBackendConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  private readonly USER_ACCOUNT_STORAGE_BACKEND_CONFIG_VALIDATE_FUNCTION: ValidateFunction<T>;
  // TODO: Remove this once data storage config is encrypted
  protected readonly SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION: ValidateFunction<ISecuredUserDataStorageConfig>;

  public constructor(config: T, configSchema: JSONSchemaType<T>, logger: LogFunctions, ajv: Ajv) {
    this.logger = logger;
    this.logger.info("Initialising User Acount Storage Backend.");
    this.config = config;
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.USER_ACCOUNT_STORAGE_BACKEND_CONFIG_VALIDATE_FUNCTION = ajv.compile<T>(configSchema);
    if (!this.isConfigValid()) {
      throw new Error(`Could not initialise User Acount Storage Backend`);
    }
    this.SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION = ajv.compile<ISecuredUserDataStorageConfig>(
      SECURED_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA
    );
  }

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

  // public abstract isLocal(): boolean;
  public abstract isUserIdAvailable(userId: UUID): boolean;
  public abstract isUsernameAvailable(username: string): boolean;
  public abstract addUser(userData: ISecuredUserSignUpPayload): boolean;
  public abstract getUserId(username: string): UUID | null;
  public abstract getSecuredUserPasswordData(userId: UUID): ISecuredPasswordData | null;
  // public abstract deleteUser(userId: UserId): boolean;
  // public abstract deleteUsers(userIds: UserId[]): boolean;
  // public abstract getUser(userId: UserId): IUser;
  // public abstract getUsers(userIds: UserId[]): IUser[];
  // public abstract getAllUsers(): IUser[];
  public abstract getUserCount(): number;
  // public abstract isIdValid(id: UserId): boolean;
  public abstract isUserDataStorageConfigIdAvailable(configId: UUID): boolean;
  public abstract addUserDataStorageConfigToUser(userId: UUID, securedUserDataStorageConfig: ISecuredUserDataStorageConfig): boolean;
  public abstract getAllUserDataStorageConfigs(userId: UUID): ISecuredUserDataStorageConfig[];
  public abstract close(): boolean;
}
