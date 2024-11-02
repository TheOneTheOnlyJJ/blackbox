export const SETTINGS_MANAGER_TYPE = {
  LocalJSON: "Local JSON"
} as const;

export type SettingsManagerTypes = typeof SETTINGS_MANAGER_TYPE;
export type SettingsManagerType = SettingsManagerTypes[keyof SettingsManagerTypes];
