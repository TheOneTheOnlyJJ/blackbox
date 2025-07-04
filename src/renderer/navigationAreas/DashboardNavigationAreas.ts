export const DASHBOARD_NAVIGATION_AREAS = {
  dashboard: "dashboard",
  dataStorages: "dataStorages",
  boxes: "boxes",
  entries: "entries",
  profile: "profile",
  settings: "settings"
} as const;

export type DashboardNavigationAreas = typeof DASHBOARD_NAVIGATION_AREAS;
export type DashboardNavigationArea = DashboardNavigationAreas[keyof DashboardNavigationAreas];
