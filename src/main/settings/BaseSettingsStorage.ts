import log, { LogFunctions } from "electron-log";
import { SettingsStorageType } from "./SettingsStorageType";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { BaseSettings } from "./BaseSettings";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IBaseSettingsStorageConfig {
  type: SettingsStorageType;
  doSaveOnUpdate: boolean;
}

export abstract class BaseSettingsStorage<TSettings extends BaseSettings, TConfig extends IBaseSettingsStorageConfig> {
  // Logging
  protected readonly logger: LogFunctions;
  // Own config
  public readonly config: TConfig;
  // Settings
  protected settings: TSettings | null;
  public readonly isValidSettings: ValidateFunction<TSettings>;
  // Save settings on update
  public doSaveOnUpdate: boolean;

  protected static readonly BASE_CONFIG_JSON_SCHEMA_CONSTANTS = {
    type: {
      title: "Type"
    },
    doSaveOnUpdate: {
      title: "Save on update"
    }
  } as const;

  public constructor(config: TConfig, settingsSchema: JSONSchemaType<TSettings>, logScope: string) {
    this.logger = log.scope(logScope);
    this.config = config;
    this.logger.info(`Initialising "${this.config.type}" Settings Storage.`);
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.isValidSettings = AJV.compile<TSettings>(settingsSchema);
    this.settings = null;
    this.doSaveOnUpdate = config.doSaveOnUpdate;
  }

  public static isValidConfig<T extends IBaseSettingsStorageConfig>(data: unknown, isValidConcreteConfig: ValidateFunction<T>): data is T {
    if (isValidConcreteConfig(data)) {
      return true;
    }
    return false;
  }

  public areSettingsInitialised(): boolean {
    return this.settings !== null;
  }

  public updateSettings(settings: TSettings): boolean {
    this.logger.debug("Updating settings.");
    if (!this.isValidSettings(settings)) {
      this.logger.error("Invalid settings! not updated!");
      return false;
    }
    this.settings = settings;
    if (this.doSaveOnUpdate) {
      this.saveSettings();
    }
    return true;
  }

  public getSettings(): TSettings | null {
    return this.settings;
  }

  public abstract fetchSettings(doUpdate: boolean): TSettings;
  public abstract saveSettings(): boolean;
}
