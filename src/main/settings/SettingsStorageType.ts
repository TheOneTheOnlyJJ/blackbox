export const SETTINGS_STORAGE_TYPES = {
  localJSON: "localJSON"
} as const;

export type SettingsStorageTypes = typeof SETTINGS_STORAGE_TYPES;
export type SettingsStorageType = SettingsStorageTypes[keyof SettingsStorageTypes];
