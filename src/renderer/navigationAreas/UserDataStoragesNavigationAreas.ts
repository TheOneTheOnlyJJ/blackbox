export const USER_DATA_STORAGES_NAVIGATION_AREAS = {
  storages: "storages",
  visibilityGroups: "visibilityGroups"
} as const;

export type UserDataStoragesNavigationAreas = typeof USER_DATA_STORAGES_NAVIGATION_AREAS;
export type UserDataStoragesNavigationArea = UserDataStoragesNavigationAreas[keyof UserDataStoragesNavigationAreas];
