import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const AJV = new Ajv();

export function createJSONValidateFunction<T>(configSchema: JSONSchemaType<T>): ValidateFunction<T> {
  return AJV.compile(configSchema);
}

export function isConfigValid<T>(config: T, validate: ValidateFunction<T>, logger: LogFunctions): boolean {
  if (validate(config)) {
    logger.debug("Valid config.");
    return true;
  } else {
    logger.debug("Invalid config.");
    logger.error("Validation errors:");
    validate.errors?.map((error) => {
      logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
    });
    return false;
  }
}

export function readConfigJSON<T>(configFilePath: string, validate: ValidateFunction<T>, logger: LogFunctions): T {
  logger.info(`Attempting to read config file at path: "${configFilePath}".`);
  if (existsSync(configFilePath)) {
    logger.debug("Found config file. Trying to open.");
    try {
      logger.silly("Reading data from config file.");
      const READ_CONFIG_DATA = readFileSync(configFilePath, "utf-8");
      logger.silly("Parsing read data as JSON.");
      const JSON_CONFIG_DATA: T = JSON.parse(READ_CONFIG_DATA) as T;
      logger.silly("Validating read JSON.");
      if (isConfigValid<T>(JSON_CONFIG_DATA, validate, logger)) {
        logger.debug("Returning read config.");
        return JSON_CONFIG_DATA;
      } else {
        throw new Error("Invalid read config & no default config");
      }
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      logger.error(`Could not read config file: "${configFilePath}". Error: ${ERROR_MESSAGE}.`);
      throw new Error("Could not read config & no default config");
    }
  } else {
    throw new Error("Could not find config file & no default config");
  }
}

export function writeConfigJSON<T>(
  config: T,
  configDir: string,
  configFileName: string,
  validate: ValidateFunction<T>,
  logger: LogFunctions
): boolean {
  const CONFIG_FILE_PATH: string = resolve(join(configDir, configFileName));
  logger.info(`Attempting to write config to file at path: "${CONFIG_FILE_PATH}".`);
  logger.silly(`Config: ${JSON.stringify(config, null, 2)}.`);
  // Do not write invalid config
  logger.silly("Validating config to write.");
  if (!isConfigValid<T>(config, validate, logger)) {
    logger.debug("Not writing invalid config to file.");
    return false;
  }
  // Create path to file
  if (existsSync(configDir)) {
    logger.debug(`Found config directory path: "${configDir}". Writing to file.`);
  } else {
    logger.debug(`Could not find config directory path: "${configDir}". Creating required directories.`);
    mkdirSync(configDir, { recursive: true });
    logger.debug(`Config directory path created: "${configDir}".`);
  }
  // Write to file
  try {
    logger.silly("Stringifying config & writing.");
    writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err: unknown) {
    const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
    logger.error(`Not writing config to file. Error: ${ERROR_MESSAGE}.`);
    return false;
  }
  logger.debug(`Config written to file at path: "${CONFIG_FILE_PATH}".`);
  return true;
}
