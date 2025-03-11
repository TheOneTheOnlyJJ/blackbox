import { LogFunctions } from "electron-log";
import { SETTINGS_MANAGER_TYPE } from "./SettingsManagerType";
import { LocalJSONSettingsManager } from "./implementations/LocalJSON/LocalJSONSettingsManager";
import { JSONSchemaType } from "ajv";
import { SettingsManager } from "./SettingsManager";
import { SettingsManagerConfig } from "./SettingsManagerConfig";
import { BaseSettings } from "./BaseSettings";

export function settingsManagerFactory<SettingsType extends BaseSettings>(
  config: SettingsManagerConfig,
  settingsSchema: JSONSchemaType<SettingsType>,
  logger: LogFunctions
): SettingsManager<SettingsType> {
  logger.debug("Running Settings Manager factory.");
  switch (config.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case SETTINGS_MANAGER_TYPE.LocalJSON:
      return new LocalJSONSettingsManager(config, settingsSchema, logger);
    default:
      throw new Error(`Invalid Settings Manager type received: ${(config.type as string).toString()}`);
  }
}
