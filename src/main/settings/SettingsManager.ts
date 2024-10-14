import { LogFunctions } from "electron-log";
import { SettingsManagerType } from "./SettingsManagerType";
import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";

export interface BaseSettingsManagerConfig {
  type: SettingsManagerType;
}

export abstract class SettingsManager<SettingsType extends NonNullable<unknown>, ConfigType extends BaseSettingsManagerConfig> {
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

  public constructor(
    config: ConfigType,
    configSchema: JSONSchemaType<ConfigType>,
    settingsSchema: JSONSchemaType<SettingsType>,
    logger: LogFunctions,
    ajv: Ajv
  ) {
    this.logger = logger;
    this.logger.info("Initialising new Settings Manager.");
    this.config = config;
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.SETTINGS_MANAGER_CONFIG_VALIDATE_FUNCTION = ajv.compile<ConfigType>(configSchema);
    if (!this.isConfigValid()) {
      throw new Error("Could not initialise Settings Manager");
    }
    this.SETTINGS_VALIDATE_FUNCTION = ajv.compile<SettingsType>(settingsSchema);
    this.settings = null;
    this.doSaveOnUpdate = false;
  }

  private isConfigValid(): boolean {
    this.logger.silly("Validating Settings Manager Config.");
    if (this.SETTINGS_MANAGER_CONFIG_VALIDATE_FUNCTION(this.config)) {
      this.logger.debug(`Valid "${this.config.type}" Settings Manager Config.`);
      return true;
    }
    this.logger.debug("Invalid Settings Manager Config.");
    this.logger.error("Validation errors:");
    this.SETTINGS_MANAGER_CONFIG_VALIDATE_FUNCTION.errors?.map((error) => {
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
      this.logger.debug("Invalid settings.");
      this.logger.error("Validation errors:");
      this.SETTINGS_VALIDATE_FUNCTION.errors?.map((error) => {
        this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
      });
      return false;
    }
  }

  public updateSettings(settings: SettingsType): boolean {
    this.logger.debug("Updating settings.");
    this.logger.silly(`Settings: ${JSON.stringify(settings, null, 2)}.`);
    if (!this.areSettingsValid(settings)) {
      this.logger.warn("Settings not updated.");
      return false;
    }
    this.settings = settings;
    this.logger.info("Settings updated.");
    if (this.doSaveOnUpdate) {
      this.saveSettings();
    }
    return true;
  }

  public getSettings(): SettingsType | null {
    this.logger.debug("Getting settings.");
    return this.settings;
  }

  public abstract fetchSettings(): SettingsType;
  public abstract saveSettings(): boolean;
}
