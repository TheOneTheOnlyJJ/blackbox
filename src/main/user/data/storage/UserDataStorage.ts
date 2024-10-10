import { LogFunctions } from "electron-log";
import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import { UserDataStorageType } from "./UserDataStorageType";

// Every user data storage must have at least the type in its config (should be further narrowed down to its own in the specific config)
export interface BaseUserDataStorageConfig {
  type: UserDataStorageType;
}

export abstract class UserDataStorage<T extends BaseUserDataStorageConfig> {
  protected readonly logger: LogFunctions;
  protected readonly config: T;
  private readonly CONFIG_VALIDATE_FUNCTION: ValidateFunction<T>;

  public constructor(config: T, configSchema: JSONSchemaType<T>, logger: LogFunctions, ajv: Ajv) {
    this.logger = logger;
    this.config = config;
    this.logger.info(`Initialising "${this.config.type}" User Data Storage.`);
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.CONFIG_VALIDATE_FUNCTION = ajv.compile<T>(configSchema);
    this.logger.silly(`Validating "${this.config.type}" User Data Storage config.`);
    if (!this.isConfigValid()) {
      throw new Error(`Could not initialise "${this.config.type}" User Data Storage`);
    }
  }

  public isConfigValid(): boolean {
    if (this.CONFIG_VALIDATE_FUNCTION(this.config)) {
      this.logger.debug("Valid config.");
      return true;
    }
    this.logger.debug("Invalid config.");
    this.logger.error("Validation errors:");
    this.CONFIG_VALIDATE_FUNCTION.errors?.map((error) => {
      this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
    });
    return false;
  }

  public getConfig(): T {
    return this.config;
  }
}
