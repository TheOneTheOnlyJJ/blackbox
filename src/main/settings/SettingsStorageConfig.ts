import { ILocalJSONSettingsStorageConfig } from "./implementations/localJSON/LocalJSONSettingsStorage";
import { SETTINGS_STORAGE_TYPES } from "./SettingsStorageType";

// Map of every settings storage backend type to its corresponding config type
export interface ISettingsStorageConfigMap {
  [SETTINGS_STORAGE_TYPES.localJSON]: ILocalJSONSettingsStorageConfig;
}
// Union of all settings storage backend config concrete implementation interfaces
export type SettingsStorageConfig = ISettingsStorageConfigMap[keyof ISettingsStorageConfigMap];
