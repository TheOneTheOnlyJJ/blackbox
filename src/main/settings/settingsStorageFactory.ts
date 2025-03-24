import { LogFunctions } from "electron-log";
import { SETTINGS_STORAGE_TYPES } from "./SettingsStorageType";
import { LocalJSONSettingsStorage } from "./implementations/localJSON/LocalJSONSettingsStorage";
import { JSONSchemaType } from "ajv";
import { SettingsStorage } from "./SettingsStorage";
import { SettingsStorageConfig } from "./SettingsStorageConfig";
import { BaseSettings } from "./BaseSettings";

export function settingsStorageFactory<SettingsType extends BaseSettings>(
  config: SettingsStorageConfig,
  settingsSchema: JSONSchemaType<SettingsType>,
  logScope: string,
  logger: LogFunctions
): SettingsStorage<SettingsType> {
  logger.debug("Running Settings Storage factory.");
  switch (config.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case SETTINGS_STORAGE_TYPES.localJSON:
      return new LocalJSONSettingsStorage(config, settingsSchema, logScope);
    default:
      throw new Error(`Invalid Settings Storage type received: ${(config.type as string).toString()}`);
  }
}
