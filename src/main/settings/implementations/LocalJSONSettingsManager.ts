import { LogFunctions } from "electron-log";
import { IBaseSettingsManagerConfig, SettingsManager } from "../SettingsManager";
import { SETTINGS_MANAGER_TYPE, SettingsManagerTypes } from "../SettingsManagerType";
import Ajv, { JSONSchemaType } from "ajv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export interface ILocalJSONSettingsManagerConfig extends IBaseSettingsManagerConfig {
  type: SettingsManagerTypes["LocalJSON"];
  fileDir: string;
  fileName: string;
}

export class LocalJSONSettingsManager<SettingsType extends Record<string, unknown>> extends SettingsManager<
  SettingsType,
  ILocalJSONSettingsManagerConfig
> {
  public static readonly CONFIG_JSON_SCHEMA_CONSTANTS = {
    type: {
      title: "Local JSON"
    },
    fileName: {
      title: "File Name",
      minLength: 1
    },
    fileDir: {
      title: "File Directory",
      minLength: 1
    }
  } as const;
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<ILocalJSONSettingsManagerConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [SETTINGS_MANAGER_TYPE.LocalJSON],
        ...LocalJSONSettingsManager.CONFIG_JSON_SCHEMA_CONSTANTS.type
      },
      fileName: {
        type: "string",
        ...LocalJSONSettingsManager.CONFIG_JSON_SCHEMA_CONSTANTS.fileName
      },
      fileDir: {
        type: "string",
        ...LocalJSONSettingsManager.CONFIG_JSON_SCHEMA_CONSTANTS.fileDir
      }
    },
    required: ["type", "fileName", "fileDir"],
    additionalProperties: false
  } as const;
  private readonly SETTINGS_FILE_PATH: string;

  public constructor(config: ILocalJSONSettingsManagerConfig, settingsSchema: JSONSchemaType<SettingsType>, logger: LogFunctions, ajv: Ajv) {
    super(config, LocalJSONSettingsManager.CONFIG_JSON_SCHEMA, settingsSchema, logger, ajv);
    this.SETTINGS_FILE_PATH = resolve(join(this.config.fileDir, this.config.fileName));
  }

  public fetchSettings(): SettingsType {
    this.logger.info(`Reading settings file at path: "${this.SETTINGS_FILE_PATH}".`);
    if (!existsSync(this.SETTINGS_FILE_PATH)) {
      throw new Error("Could not find settings file");
    }
    this.logger.debug("Found settings file. Trying to open.");
    try {
      this.logger.silly("Reading from settings file.");
      const READ_CONFIG_DATA = readFileSync(this.SETTINGS_FILE_PATH, "utf-8");
      this.logger.silly("Parsing read data as JSON.");
      const JSON_CONFIG_DATA: SettingsType = JSON.parse(READ_CONFIG_DATA) as SettingsType;
      this.logger.silly("Valid read JSON.");
      if (!this.areSettingsValid(JSON_CONFIG_DATA)) {
        throw new Error("Fetched invalid settings");
      }
      this.logger.silly("Returning read settings.");
      return JSON_CONFIG_DATA;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      throw new Error(`Could not read settings file: "${this.SETTINGS_FILE_PATH}". Error: ${ERROR_MESSAGE}.`);
    }
  }

  public saveSettings(): boolean {
    // Settings must be initialised to be written to file
    if (this.settings === null) {
      this.logger.warn("Could not write uninitialised settings to JSON file.");
      return false;
    }
    this.logger.info(`Writing settings to file at path: "${this.SETTINGS_FILE_PATH}".`);
    this.logger.silly(`Settings: ${JSON.stringify(this.settings, null, 2)}.`);
    // Create path to file
    if (existsSync(this.config.fileDir)) {
      this.logger.debug(`Found settings directory path: "${this.config.fileDir}". Writing to file.`);
    } else {
      try {
        this.logger.debug(`Could not find settings directory path: "${this.config.fileDir}". Creating required directories.`);
        mkdirSync(this.config.fileDir, { recursive: true });
        this.logger.debug(`Settings directory path created: "${this.config.fileDir}".`);
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.logger.error(`Could not create settings directory path "${this.config.fileDir}". Error: ${ERROR_MESSAGE}.`);
        return false;
      }
    }
    // Write to file
    try {
      this.logger.silly("Stringifying settings & writing.");
      writeFileSync(this.SETTINGS_FILE_PATH, JSON.stringify(this.settings, null, 2), "utf-8");
      this.logger.debug(`Settings written to file at path: "${this.SETTINGS_FILE_PATH}".`);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Not writing settings to file. Error: ${ERROR_MESSAGE}.`);
      return false;
    }
  }
}
