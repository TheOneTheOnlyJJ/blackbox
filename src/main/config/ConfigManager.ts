import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export class ConfigManager<T extends object> {
  private readonly logger: LogFunctions;
  private readonly defaultConfig: null | T;
  private readonly validate: ValidateFunction<T>;

  public constructor(configSchema: JSONSchemaType<T>, defaultConfig: null | T, logger: LogFunctions) {
    this.logger = logger;
    this.defaultConfig = defaultConfig;
    this.logger.info(`Initialising Config Manager.`);
    this.logger.silly(`Config schema: ${JSON.stringify(configSchema, null, 2)}.`);
    this.logger.silly(`Default config: ${this.defaultConfig === null ? '"null"' : JSON.stringify(this.defaultConfig, null, 2)}.`);
    this.validate = new Ajv().compile(configSchema);
    if (this.defaultConfig !== null) {
      this.logger.silly(`Validating default config.`);
      if (!this.isConfigValid(this.defaultConfig)) {
        throw new Error("Given default config does not conform to the schema");
      }
    }
    this.logger.debug("Config Manager ready.");
  }

  public isConfigValid(config: T): boolean {
    if (this.validate(config)) {
      this.logger.debug("Valid config.");
      return true;
    } else {
      this.logger.debug("Invalid config.");
      this.logger.error("Validation errors:");
      this.validate.errors?.map((error) => {
        this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
      });
      return false;
    }
  }

  public readJSON(configDir: string, configFileName: string): T {
    const CONFIG_FILE_PATH: string = resolve(join(configDir, configFileName));
    this.logger.info(`Attempting to read config file at path: "${CONFIG_FILE_PATH}".`);
    if (existsSync(CONFIG_FILE_PATH)) {
      this.logger.debug(`Found config file. Opening.`);
      try {
        const READ_CONFIG_DATA = readFileSync(CONFIG_FILE_PATH, "utf-8");
        this.logger.silly("Read data from config file. Parsing as JSON.");
        const JSON_CONFIG_DATA: T = JSON.parse(READ_CONFIG_DATA) as T;
        this.logger.silly("Parsed read data as JSON.");
        this.logger.silly("Validating read JSON.");
        if (this.isConfigValid(JSON_CONFIG_DATA)) {
          this.logger.debug("Returning read config.");
          return JSON_CONFIG_DATA;
        } else {
          if (this.defaultConfig !== null) {
            this.logger.debug("Returning default config.");
            return this.defaultConfig;
          } else {
            throw new Error("Invalid read config & no default config");
          }
        }
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.logger.error(`Could not read config file: "${CONFIG_FILE_PATH}". Error: ${ERROR_MESSAGE}.`);
        if (this.defaultConfig !== null) {
          this.logger.debug("Returning default config.");
          return this.defaultConfig;
        } else {
          throw new Error("Could not read config & no default config");
        }
      }
    } else {
      if (this.defaultConfig !== null) {
        this.logger.debug("Could not find config file. Returning default config.");
        return this.defaultConfig;
      } else {
        throw new Error("Could not find config file & no default config");
      }
    }
  }

  public writeJSON(config: T, configDir: string, configFileName: string): boolean {
    const CONFIG_FILE_PATH: string = resolve(join(configDir, configFileName));
    this.logger.info(`Attempting to write config to file at path: "${CONFIG_FILE_PATH}".`);
    this.logger.silly(`Config: ${JSON.stringify(config, null, 2)}.`);
    // Do not write invalid config
    this.logger.silly("Validating config to write.");
    if (!this.isConfigValid(config)) {
      this.logger.debug("Not writing invalid config to file.");
      return false;
    }
    // Create path to file
    if (existsSync(configDir)) {
      this.logger.debug(`Found config directory path: "${configDir}". Writing to file.`);
    } else {
      this.logger.debug(`Could not find config directory path: "${configDir}". Creating required directories.`);
      mkdirSync(configDir, { recursive: true });
      this.logger.debug(`Config directory path created: "${configDir}".`);
    }
    // Write to file
    try {
      this.logger.silly("Stringifying config.");
      writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Not writing config to file. Error: ${ERROR_MESSAGE}.`);
      return false;
    }
    this.logger.debug(`Config written to file at path: "${CONFIG_FILE_PATH}".`);
    return true;
  }
}
