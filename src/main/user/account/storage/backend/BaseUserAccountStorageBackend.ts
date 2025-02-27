import { LogFunctions } from "electron-log";
import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import { ISecuredUserSignUpPayload } from "../../SecuredUserSignUpPayload";
import { UUID } from "node:crypto";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { IBaseUserAccountStorageBackendConfig } from "./config/BaseUserAccountStorageBackendConfig";
import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";

export abstract class BaseUserAccountStorageBackend<T extends IBaseUserAccountStorageBackendConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  private readonly USER_ACCOUNT_STORAGE_BACKEND_CONFIG_VALIDATE_FUNCTION: ValidateFunction<T>;

  public constructor(config: T, configSchema: JSONSchemaType<T>, logger: LogFunctions, ajv: Ajv) {
    this.logger = logger;
    this.logger.info("Initialising User Acount Storage Backend.");
    this.config = config;
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.USER_ACCOUNT_STORAGE_BACKEND_CONFIG_VALIDATE_FUNCTION = ajv.compile<T>(configSchema);
    if (!this.isConfigValid()) {
      throw new Error(`Could not initialise User Acount Storage Backend`);
    }
  }

  public abstract open(): void; // Returns isOpen
  public abstract close(): void; // Returns isOpen
  public abstract isOpen(): boolean;
  public abstract isLocal(): boolean;
  public abstract isUserIdAvailable(userId: UUID): boolean;
  public abstract isUsernameAvailable(username: string): boolean;
  public abstract addUser(securedUserSignInPayload: ISecuredUserSignUpPayload): boolean;
  public abstract getUserId(username: string): UUID | null;
  public abstract getSecuredUserPassword(userId: UUID): ISecuredPassword | null;
  public abstract getUserDataEncryptionAESKeySalt(userId: UUID): string | null;
  public abstract getUserCount(): number;
  public abstract isUserDataStorageIdAvailable(storageId: UUID): boolean;
  public abstract addStorageSecuredUserDataStorageConfig(encryptedStorageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): boolean;
  public abstract getAllStorageSecuredUserDataStorageConfigs(userId: UUID): IStorageSecuredUserDataStorageConfig[];

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
