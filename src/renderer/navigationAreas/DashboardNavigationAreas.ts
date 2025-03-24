export const DASHBOARD_NAVIGATION_AREAS = {
  dashboard: "dashboard",
  userData: "userData",
  profile: "profile",
  settings: "settings"
} as const;

export type DashboardNavigationAreas = typeof DASHBOARD_NAVIGATION_AREAS;
export type DashboardNavigationArea = DashboardNavigationAreas[keyof DashboardNavigationAreas];
