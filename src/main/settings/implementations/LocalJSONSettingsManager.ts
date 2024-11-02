import { LogFunctions } from "electron-log";
import { BaseSettingsManagerConfig, SettingsManager } from "../SettingsManager";
import { SETTINGS_MANAGER_TYPE, SettingsManagerTypes } from "../SettingsManagerType";
import Ajv, { JSONSchemaType } from "ajv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export interface LocalJSONSettingsManagerConfig extends BaseSettingsManagerConfig {
  type: SettingsManagerTypes["LocalJSON"];
  fileDir: string;
  fileName: string;
}

export class LocalJSONSettingsManager<SettingsType extends Record<string, unknown>> extends SettingsManager<
  SettingsType,
  LocalJSONSettingsManagerConfig
> {
  public static readonly CONFIG_SCHEMA: JSONSchemaType<LocalJSONSettingsManagerConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [SETTINGS_MANAGER_TYPE.LocalJSON]
      },
      fileName: {
        type: "string",
        minLength: 1
      },
      fileDir: {
        type: "string",
        minLength: 1
      }
    },
    required: ["type", "fileName", "fileDir"],
    additionalProperties: false
  };
  private readonly SETTINGS_FILE_PATH: string;

  public constructor(config: LocalJSONSettingsManagerConfig, settingsSchema: JSONSchemaType<SettingsType>, logger: LogFunctions, ajv: Ajv) {
    super(config, LocalJSONSettingsManager.CONFIG_SCHEMA, settingsSchema, logger, ajv);
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
