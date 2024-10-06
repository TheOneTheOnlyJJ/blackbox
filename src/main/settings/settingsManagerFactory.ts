import { LogFunctions } from "electron-log";
import { SettingsManager } from "./SettingsManager";
import { SettingsManagerType } from "./SettingsManagerType";
import { LocalJSONSettingsManager, LocalJSONSettingsManagerConfig } from "./implementations/LocalJSONSettingsManager";
import { JSONSchemaType } from "ajv";

// Union of all settings manager concrete implementation configuration interfaces
export type SettingsManagerConfig = LocalJSONSettingsManagerConfig;

export function settingsManagerFactory<SettingsType extends NonNullable<unknown>>(
  config: SettingsManagerConfig,
  settingsSchema: JSONSchemaType<SettingsType>,
  logger: LogFunctions
): SettingsManager<SettingsType, SettingsManagerConfig> {
  logger.debug(`Running settings manager factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case SettingsManagerType.LocalJSON:
      return new LocalJSONSettingsManager(config, settingsSchema, logger);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid settings manager type received: ${config.type}`);
  }
}
