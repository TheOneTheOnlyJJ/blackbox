import { LogFunctions } from "electron-log";
import { SettingsManagerType } from "./SettingsManagerType";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { createJSONValidateFunction, isConfigValid } from "../utils/config/config";

export interface BaseSettingsManagerConfig {
  type: SettingsManagerType;
}

export abstract class SettingsManager<SettingsType extends NonNullable<unknown>, ConfigType extends BaseSettingsManagerConfig> {
  // Logging
  protected readonly logger: LogFunctions;
  // Own config
  protected readonly config: ConfigType;
  private readonly CONFIG_VALIDATE_FUNCTION: ValidateFunction<ConfigType>;
  // Settings
  protected settings: SettingsType | null;
  protected readonly SETTINGS_VALIDATE_FUNCTION: ValidateFunction<SettingsType>;
  // Save settings on update
  public doSaveSettingsOnUpdate: boolean;

  public constructor(
    config: ConfigType,
    configSchema: JSONSchemaType<ConfigType>,
    settingsSchema: JSONSchemaType<SettingsType>,
    logger: LogFunctions
  ) {
    this.logger = logger;
    this.logger.info(`Initialising new "${config.type}" Settings Manager.`);
    this.logger.silly(`Config: ${JSON.stringify(config, null, 2)}.`);
    this.CONFIG_VALIDATE_FUNCTION = createJSONValidateFunction<ConfigType>(configSchema);
    this.logger.silly(`Validating "${config.type}" Settings Manager config.`);
    if (!isConfigValid<ConfigType>(config, this.CONFIG_VALIDATE_FUNCTION, this.logger)) {
      throw new Error(`Could not initialise "${config.type}" Settings Manager`);
    }
    this.config = config;
    this.SETTINGS_VALIDATE_FUNCTION = createJSONValidateFunction<SettingsType>(settingsSchema);
    this.settings = null;
    this.doSaveSettingsOnUpdate = false;
  }

  public getConfig(): ConfigType {
    return this.config;
  }

  public areSettingsInitialised(): boolean {
    return this.settings !== null;
  }

  public areSettingsValid(settings: SettingsType): boolean {
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
    if (this.areSettingsValid(settings)) {
      this.settings = settings;
      this.logger.info("Settings updated.");
      if (this.doSaveSettingsOnUpdate) {
        this.saveSettings();
      }
      return true;
    }
    this.logger.warn("Settings not updated.");
    return false;
  }

  public getSettings(): SettingsType | null {
    return this.settings;
  }

  public abstract fetchSettings(): SettingsType;
  public abstract saveSettings(): boolean;
}
