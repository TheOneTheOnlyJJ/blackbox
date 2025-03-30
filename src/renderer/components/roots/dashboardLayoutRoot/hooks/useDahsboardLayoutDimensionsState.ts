import { LogFunctions } from "electron-log";
import { MutableRefObject, useCallback, useEffect, useLayoutEffect, useState } from "react";

// export const DEFAULT_DASHBOARD_NAVIGATION_BAR_WIDTH = 240;

export const useDahsboardLayoutDimensionsState = (
  logger: LogFunctions,
  dashboardAppBarRef: MutableRefObject<HTMLDivElement | null>
  // dashboardNavigationBarRef: MutableRefObject<HTMLDivElement | null>
): {
  dashboardAppBarHeight: number;
  // dashboardNavigationBarWidth: number;
} => {
  const [dashboardAppBarHeight, setDashboardAppBarHeight] = useState<number>(0);
  // const [dashboardNavigationBarWidth, setDashboardNavigationBarWidth] = useState<number>(DEFAULT_DASHBOARD_NAVIGATION_BAR_WIDTH);

  useEffect((): void => {
    logger.silly(`Updated Dashboard App Bar height: ${dashboardAppBarHeight.toString()}.`);
  }, [logger, dashboardAppBarHeight]);

  // useEffect((): void => {
  //   logger.silly(`Updated Dashboard Navigation Bar width: ${dashboardNavigationBarWidth.toString()}.`);
  // }, [logger, dashboardNavigationBarWidth]);

  const updateDashboardAppBarHeight = useCallback((): void => {
    if (dashboardAppBarRef.current) {
      setDashboardAppBarHeight(dashboardAppBarRef.current.clientHeight);
    }
  }, [dashboardAppBarRef]);

  // const updateDashboardNavigationbarWidth = useCallback((): void => {
  //   if (dashboardNavigationBarRef.current) {
  //     setDashboardNavigationBarWidth(dashboardNavigationBarRef.current.clientWidth);
  //   }
  // }, [dashboardNavigationBarRef]);

  const updateDashboardLayoutComponentDimensions = useCallback((): void => {
    updateDashboardAppBarHeight();
    // updateDashboardNavigationbarWidth();
  }, [updateDashboardAppBarHeight]);

  // Measure the necessary component dimensions
  useLayoutEffect((): (() => void) => {
    // Set initial dimensions
    updateDashboardLayoutComponentDimensions();
    // Add event listener for window resize
    window.addEventListener("resize", updateDashboardLayoutComponentDimensions);
    // Cleanup event listener on component unmount
    return (): void => {
      window.removeEventListener("resize", updateDashboardLayoutComponentDimensions);
    };
  }, [updateDashboardLayoutComponentDimensions]);

  return {
    dashboardAppBarHeight: dashboardAppBarHeight
    // dashboardNavigationBarWidth: dashboardNavigationBarWidth
  };
};
