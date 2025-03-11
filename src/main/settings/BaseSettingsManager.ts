import { LogFunctions } from "electron-log";
import { SettingsManagerType } from "./SettingsManagerType";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { BaseSettings } from "./BaseSettings";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IBaseSettingsManagerConfig {
  type: SettingsManagerType;
  doSaveOnUpdate: boolean;
}

export abstract class BaseSettingsManager<SettingsType extends BaseSettings, ConfigType extends IBaseSettingsManagerConfig> {
  // Logging
  protected readonly logger: LogFunctions;
  // Own config
  public readonly config: ConfigType;
  private readonly SETTINGS_MANAGER_CONFIG_VALIDATE_FUNCTION: ValidateFunction<ConfigType>;
  // Settings
  protected settings: SettingsType | null;
  protected readonly SETTINGS_VALIDATE_FUNCTION: ValidateFunction<SettingsType>;
  // Save settings on update
  public doSaveOnUpdate: boolean;

  protected static readonly BASE_CONFIG_JSON_SCHEMA_CONSTANTS = {
    doSaveOnUpdate: {
      title: "Save on update"
    }
  } as const;

  public constructor(
    config: ConfigType,
    configSchema: JSONSchemaType<ConfigType>,
    settingsSchema: JSONSchemaType<SettingsType>,
    logger: LogFunctions
  ) {
    this.logger = logger;
    this.logger.info("Initialising new Settings Manager.");
    this.config = config;
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.SETTINGS_MANAGER_CONFIG_VALIDATE_FUNCTION = AJV.compile<ConfigType>(configSchema);
    if (!this.isConfigValid()) {
      throw new Error("Could not initialise Settings Manager");
    }
    this.SETTINGS_VALIDATE_FUNCTION = AJV.compile<SettingsType>(settingsSchema);
    this.settings = null;
    this.doSaveOnUpdate = config.doSaveOnUpdate;
  }

  private isConfigValid(): boolean {
    this.logger.silly("Validating Settings Manager Config.");
    if (this.SETTINGS_MANAGER_CONFIG_VALIDATE_FUNCTION(this.config)) {
      this.logger.debug(`Valid "${this.config.type}" Settings Manager Config.`);
      return true;
    }
    this.logger.error("Invalid Settings Manager Config.");
    this.logger.error("Validation errors:");
    this.SETTINGS_MANAGER_CONFIG_VALIDATE_FUNCTION.errors?.map((error): void => {
      this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
    });
    return false;
  }

  public areSettingsInitialised(): boolean {
    return this.settings !== null;
  }

  public areSettingsValid(settings: SettingsType): boolean {
    this.logger.debug("Validating settings.");
    if (this.SETTINGS_VALIDATE_FUNCTION(settings)) {
      this.logger.debug("Valid settings.");
      return true;
    } else {
      this.logger.error("Invalid settings.");
      this.logger.error("Validation errors:");
      this.SETTINGS_VALIDATE_FUNCTION.errors?.map((error) => {
        this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
      });
      return false;
    }
  }

  public updateSettings(settings: SettingsType): boolean {
    this.logger.debug("Updating settings.");
    if (!this.areSettingsValid(settings)) {
      this.logger.warn("Settings not updated.");
      return false;
    }
    this.settings = settings;
    this.logger.info("Updated settings.");
    if (this.doSaveOnUpdate) {
      this.saveSettings();
    }
    return true;
  }

  public getSettings(): SettingsType | null {
    return this.settings;
  }

  public abstract fetchSettings(doUpdate: boolean): SettingsType;
  public abstract saveSettings(): boolean;
}
