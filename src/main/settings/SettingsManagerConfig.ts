import { ILocalJSONSettingsManagerConfig } from "./implementations/LocalJSON/LocalJSONSettingsManager";
import { SETTINGS_MANAGER_TYPE } from "./SettingsManagerType";

// Map of every user account storage backend type to its corresponding config type
export interface ISettingsManagerConfigMap {
  [SETTINGS_MANAGER_TYPE.LocalJSON]: ILocalJSONSettingsManagerConfig;
}
// Union of all user account storage backend config concrete implementation interfaces
export type SettingsManagerConfig = ISettingsManagerConfigMap[keyof ISettingsManagerConfigMap];
