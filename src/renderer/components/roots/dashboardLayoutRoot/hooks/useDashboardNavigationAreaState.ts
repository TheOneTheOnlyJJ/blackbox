import { DashboardNavigationArea } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { LogFunctions } from "electron-log";
import { useState, useEffect, Dispatch, SetStateAction } from "react";

export const useDashboardNavigationAreaState = (
  logger: LogFunctions
): [DashboardNavigationArea | null, Dispatch<SetStateAction<DashboardNavigationArea | null>>] => {
  const [dashboardNavigationArea, setDashboardNavigationArea] = useState<DashboardNavigationArea | null>(null);

  useEffect((): void => {
    logger.info(`Dashboard navigation area changed: ${dashboardNavigationArea === null ? "null" : `"${dashboardNavigationArea}"`}.`);
  }, [logger, dashboardNavigationArea]);

  return [dashboardNavigationArea, setDashboardNavigationArea];
};
