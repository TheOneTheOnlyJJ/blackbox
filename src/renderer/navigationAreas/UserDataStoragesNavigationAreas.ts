// TODO: Rename this to just USER_DATA_NAV....
export const USER_DATA_STORAGES_NAVIGATION_AREAS = {
  availableStorages: "availableStorages",
  visibilityGroups: "visibilityGroups"
} as const;

export type UserDataStoragesNavigationAreas = typeof USER_DATA_STORAGES_NAVIGATION_AREAS;
export type UserDataStoragesNavigationArea = UserDataStoragesNavigationAreas[keyof UserDataStoragesNavigationAreas];
