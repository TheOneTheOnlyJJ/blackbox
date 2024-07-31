import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export class ConfigManager<T extends object> {
  readonly logger: LogFunctions;
  readonly defaultConfig: T;
  readonly configDir: string;
  readonly configFileName: string;
  readonly configFilePath: string;
  readonly validate: ValidateFunction<T>;

  constructor(configSchema: JSONSchemaType<T>, defaultConfig: T, configDir: string, configFileName: string, logger: LogFunctions) {
    this.logger = logger;
    this.logger.info(`Initialising Config Manager.`);
    this.logger.silly(`Config schema: ${JSON.stringify(configSchema, null, 2)}.`);
    this.logger.silly(`Default config: ${JSON.stringify(defaultConfig, null, 2)}.`);
    this.logger.silly(`Config file directory: "${configDir}".`);
    this.logger.silly(`Config file name: "${configFileName}".`);
    this.validate = new Ajv().compile(configSchema);
    if (!this.isConfigValid(defaultConfig)) {
      throw new Error("Given default config does not conform to the schema");
    }
    this.defaultConfig = defaultConfig;
    this.configDir = configDir;
    this.configFileName = configFileName;
    this.configFilePath = resolve(join(this.configDir, this.configFileName));
    this.logger.debug("Config Manager ready.");
  }

  public isConfigValid(config: T): boolean {
    this.logger.debug(`Validating config: ${JSON.stringify(config, null, 2)}.`);
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

  public read(): T {
    this.logger.info(`Attempting to read config from file "${this.configFileName}" at path: "${this.configFilePath}".`);
    if (existsSync(this.configFilePath)) {
      this.logger.debug(`Found config file. Opening.`);
      try {
        const READ_CONFIG_DATA = readFileSync(this.configFilePath, "utf-8");
        this.logger.silly("Read data from config file. Parsing as JSON.");
        const JSON_CONFIG_DATA: T = JSON.parse(READ_CONFIG_DATA) as T;
        this.logger.silly(`Parsed read data as JSON.`);
        if (this.isConfigValid(JSON_CONFIG_DATA)) {
          this.logger.debug("Returning read config.");
          return JSON_CONFIG_DATA;
        } else {
          this.logger.debug("Returning default config.");
          return this.defaultConfig;
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error(`Could not read config file: "${this.configFilePath}". Error: ${errorMessage}.`);
        this.logger.debug("Returning default config.");
        return this.defaultConfig;
      }
    } else {
      this.logger.debug("Could not find config file. Returning default config.");
      return this.defaultConfig;
    }
  }

  public write(config: T): boolean {
    this.logger.info(`Attempting to write config to file "${this.configFileName}" at path: "${this.configFilePath}".`);
    // Do not write invalid config
    if (!this.isConfigValid(config)) {
      this.logger.debug("Not writing invalid config to file.");
      return false;
    }
    // Create path to file
    if (existsSync(this.configDir)) {
      this.logger.debug(`Found config directory path: "${this.configDir}". Writing to file.`);
    } else {
      this.logger.debug(`Could not find config directory path: "${this.configDir}". Creating required directories.`);
      mkdirSync(this.configDir, { recursive: true });
      this.logger.debug(`Config directory path created: "${this.configDir}".`);
    }
    // Write to file
    try {
      this.logger.silly("Stringifying config.");
      writeFileSync(this.configFilePath, JSON.stringify(config, null, 2), "utf-8");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Not writing config to file. Error: ${errorMessage}.`);
      return false;
    }
    this.logger.debug(`Config written to file "${this.configFileName}" at path: "${this.configFilePath}".`);
    return true;
  }
}
