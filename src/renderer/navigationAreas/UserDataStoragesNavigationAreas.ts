export const USER_DATA_NAVIGATION_AREAS = {
  storageConfigs: "storageConfigs",
  visibilityGroups: "visibilityGroups",
  activeStorages: "activeStorages"
} as const;

export type UserDataNavigationAreas = typeof USER_DATA_NAVIGATION_AREAS;
export type UserDataNavigationArea = UserDataNavigationAreas[keyof UserDataNavigationAreas];
