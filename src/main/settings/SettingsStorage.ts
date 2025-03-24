import { BaseSettings } from "./BaseSettings";
import { LocalJSONSettingsStorage } from "./implementations/localJSON/LocalJSONSettingsStorage";
import { SETTINGS_STORAGE_TYPES } from "./SettingsStorageType";

// Map of every settings storage backend type to its corresponding config type
export interface ISettingsStorageMap<SettingsType extends BaseSettings> {
  [SETTINGS_STORAGE_TYPES.localJSON]: LocalJSONSettingsStorage<SettingsType>;
}
// Union of all settings storage backend config concrete implementation interfaces
export type SettingsStorage<SettingsType extends BaseSettings> = ISettingsStorageMap<SettingsType>[keyof ISettingsStorageMap<SettingsType>];
