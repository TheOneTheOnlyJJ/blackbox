export const USER_DATA_BOXES_NAVIGATION_AREAS = {
  availableBoxes: "availableBoxes",
  availableTemplates: "availableTemplates"
} as const;

export type UserDataBoxesNavigationAreas = typeof USER_DATA_BOXES_NAVIGATION_AREAS;
export type UserDataBoxesNavigationArea = UserDataBoxesNavigationAreas[keyof UserDataBoxesNavigationAreas];
