export const USER_DATA_NAVIGATION_AREAS = {
  availableStorages: "availableStorages",
  visibilityGroups: "visibilityGroups"
} as const;

export type UserDataNavigationAreas = typeof USER_DATA_NAVIGATION_AREAS;
export type UserDataNavigationArea = UserDataNavigationAreas[keyof UserDataNavigationAreas];
