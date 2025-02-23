import { BaseSettings } from "./BaseSettings";
import { LocalJSONSettingsManager } from "./implementations/LocalJSON/LocalJSONSettingsManager";
import { SETTINGS_MANAGER_TYPE } from "./SettingsManagerType";

// Map of every user account storage backend type to its corresponding config type
export interface ISettingsManagerMap<SettingsType extends BaseSettings> {
  [SETTINGS_MANAGER_TYPE.LocalJSON]: LocalJSONSettingsManager<SettingsType>;
}
// Union of all user account storage backend config concrete implementation interfaces
export type SettingsManager<SettingsType extends BaseSettings> = ISettingsManagerMap<SettingsType>[keyof ISettingsManagerMap<SettingsType>];
