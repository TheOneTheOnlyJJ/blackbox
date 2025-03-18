import { LogFunctions } from "electron-log";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { IBaseUserDataStorageBackendConfig } from "./config/BaseUserDataStorageBackendConfig";
import { AJV } from "@shared/utils/AJVJSONValidator";

export abstract class BaseUserDataStorageBackend<T extends IBaseUserDataStorageBackendConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  private readonly CONFIG_VALIDATE_FUNCTION: ValidateFunction<T>;

  public constructor(config: T, configSchema: JSONSchemaType<T>, logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising User Data Storage Backend.");
    this.config = config;
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.CONFIG_VALIDATE_FUNCTION = AJV.compile<T>(configSchema);
    if (!this.isConfigValid()) {
      throw new Error("Could not initialise User Data Storage Backend");
    }
  }

  public abstract open(): boolean;
  public abstract close(): boolean;
  public abstract isOpen(): boolean;
  public abstract isClosed(): boolean;
  public abstract isLocal(): boolean;

  public isConfigValid(): boolean {
    this.logger.silly("Validating User Data Storage Backend Config.");
    if (this.CONFIG_VALIDATE_FUNCTION(this.config)) {
      this.logger.debug(`Valid "${this.config.type}" User Data Storage Backend Config.`);
      return true;
    }
    this.logger.debug("Invalid User Data Storage Backend Config.");
    this.logger.error("Validation errors:");
    this.CONFIG_VALIDATE_FUNCTION.errors?.map((error) => {
      this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
    });
    return false;
  }
}
