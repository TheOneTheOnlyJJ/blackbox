import { IBaseSettingsStorageConfig, BaseSettingsStorage } from "../../BaseSettingsStorage";
import { SETTINGS_STORAGE_TYPES, SettingsStorageTypes } from "../../SettingsStorageType";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface ILocalJSONSettingsStorageConfig extends IBaseSettingsStorageConfig {
  type: SettingsStorageTypes["localJSON"];
  fileDir: string;
  fileName: string;
}

export class LocalJSONSettingsStorage<SettingsType extends Record<string, unknown>> extends BaseSettingsStorage<
  SettingsType,
  ILocalJSONSettingsStorageConfig
> {
  public static readonly CONFIG_JSON_SCHEMA_CONSTANTS = {
    fileName: {
      title: "File Name",
      minLength: 1
    },
    fileDir: {
      title: "File Directory",
      minLength: 1
    }
  } as const;
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<ILocalJSONSettingsStorageConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [SETTINGS_STORAGE_TYPES.localJSON],
        ...BaseSettingsStorage.BASE_CONFIG_JSON_SCHEMA_CONSTANTS.type
      },
      doSaveOnUpdate: { type: "boolean", ...BaseSettingsStorage.BASE_CONFIG_JSON_SCHEMA_CONSTANTS.doSaveOnUpdate },
      fileName: { type: "string", ...LocalJSONSettingsStorage.CONFIG_JSON_SCHEMA_CONSTANTS.fileName },
      fileDir: { type: "string", ...LocalJSONSettingsStorage.CONFIG_JSON_SCHEMA_CONSTANTS.fileDir }
    },
    required: ["type", "doSaveOnUpdate", "fileName", "fileDir"],
    additionalProperties: false
  } as const;
  public static readonly isValidLocalJSONSettingsStorageConfig: ValidateFunction<ILocalJSONSettingsStorageConfig> =
    AJV.compile<ILocalJSONSettingsStorageConfig>(LocalJSONSettingsStorage.CONFIG_JSON_SCHEMA);

  private readonly SETTINGS_FILE_PATH: string;

  public constructor(config: ILocalJSONSettingsStorageConfig, settingsSchema: JSONSchemaType<SettingsType>, logScope: string) {
    if (!BaseSettingsStorage.isValidConfig<ILocalJSONSettingsStorageConfig>(config, LocalJSONSettingsStorage.isValidLocalJSONSettingsStorageConfig)) {
      throw new Error(`Invalid "${SETTINGS_STORAGE_TYPES.localJSON}" Settings Storage Config`);
    }
    super(config, settingsSchema, logScope);
    this.SETTINGS_FILE_PATH = resolve(join(this.config.fileDir, this.config.fileName));
  }

  public fetchSettings(doUpdate: boolean): SettingsType {
    this.logger.info(`Fetching settings from JSON file: "${this.SETTINGS_FILE_PATH}".`);
    if (!existsSync(this.SETTINGS_FILE_PATH)) {
      throw new Error("Settings file not found");
    }
    try {
      const FETCHED_SETTINGS: SettingsType = JSON.parse(readFileSync(this.SETTINGS_FILE_PATH, "utf-8")) as SettingsType;
      if (!this.isValidSettings(FETCHED_SETTINGS)) {
        throw new Error("Fetched invalid settings");
      }
      // This avoids the redundant save if saveOnUpdate is set
      if (doUpdate) {
        this.logger.info("Updating settings.");
        this.settings = FETCHED_SETTINGS;
      }
      return FETCHED_SETTINGS;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      throw new Error(`Settings fetch error: ${ERROR_MESSAGE}.`);
    }
  }

  public saveSettings(): boolean {
    this.logger.info(`Saving settings to JSON file: "${this.SETTINGS_FILE_PATH}".`);
    if (this.settings === null) {
      this.logger.warn("Settings uninitialised. No-op.");
      return false;
    }
    if (!existsSync(this.config.fileDir)) {
      this.logger.warn(`Settings directory not found: "${this.config.fileDir}".`);
      try {
        mkdirSync(this.config.fileDir, { recursive: true });
        this.logger.info(`Created settings directory: "${this.config.fileDir}".`);
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.logger.error(`Settings directory creation error: ${ERROR_MESSAGE}! No-op.`);
        return false;
      }
    }
    // Write to file
    try {
      writeFileSync(this.SETTINGS_FILE_PATH, JSON.stringify(this.settings, null, 2), "utf-8");
      this.logger.debug("Settings saved.");
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Settings save error: ${ERROR_MESSAGE}! No-op.`);
      return false;
    }
  }
}
