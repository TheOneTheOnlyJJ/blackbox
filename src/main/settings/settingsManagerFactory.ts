import { LogFunctions } from "electron-log";
import { SettingsManager } from "./SettingsManager";
import { SETTINGS_MANAGER_TYPE } from "./SettingsManagerType";
import { LocalJSONSettingsManager, ILocalJSONSettingsManagerConfig } from "./implementations/LocalJSONSettingsManager";
import Ajv, { JSONSchemaType } from "ajv";

// Union of all settings manager concrete implementation config interfaces
export type SettingsManagerConfig = ILocalJSONSettingsManagerConfig;

export function settingsManagerFactory<SettingsType extends NonNullable<unknown>>(
  config: SettingsManagerConfig,
  settingsSchema: JSONSchemaType<SettingsType>,
  logger: LogFunctions,
  ajv: Ajv
): SettingsManager<SettingsType, SettingsManagerConfig> {
  logger.debug(`Running Settings Manager factory with config: ${JSON.stringify(config, null, 2)}.`);
  switch (config.type) {
    case SETTINGS_MANAGER_TYPE.LocalJSON:
      return new LocalJSONSettingsManager(config, settingsSchema, logger, ajv);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid Settings Manager type received: ${config.type}`);
  }
}
