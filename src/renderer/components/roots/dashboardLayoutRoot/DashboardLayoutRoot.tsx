import Box from "@mui/material/Box/Box";
import { FC, MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import DashboardAppBar from "@renderer/components/appBars/DashboardAppBar";
import DashboardNavigationBar from "@renderer/components/navigation/DashboardNavigationBar";
import { Outlet } from "react-router-dom";
import { appLogger } from "@renderer/utils/loggers";
import { IDashboardLayoutRootContext } from "./DashboardLayoutRootContext";
import { DashboardNavigationArea } from "@renderer/navigationAreas/DashboardNavigationAreas";

const DEFAULT_DASHBOARD_NAVIGATION_BAR_WIDTH = 240;

const DashboardLayoutRoot: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const dashboardAppBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const dashboardNavigationBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [dashboardAppBarHeight, setDashboardAppBarHeight] = useState<number>(0);
  const [dashboardAppBarTitle, setDashboardAppBarTitle] = useState<string>("");
  const [dashboardNavigationBarWidth, setDashboardNavigationBarWidth] = useState<number>(DEFAULT_DASHBOARD_NAVIGATION_BAR_WIDTH);
  const [dashboardNavigationArea, setDashboardNavigationArea] = useState<DashboardNavigationArea | null>(null);

  const updateDashboardAppBarHeight = useCallback((): void => {
    if (dashboardAppBarRef.current) {
      setDashboardAppBarHeight(dashboardAppBarRef.current.clientHeight);
    }
  }, [dashboardAppBarRef]);

  const updateDashboardNavigationbarWidth = useCallback((): void => {
    if (dashboardNavigationBarRef.current) {
      setDashboardNavigationBarWidth(dashboardNavigationBarRef.current.clientWidth);
    }
  }, [dashboardNavigationBarRef]);

  const updateDashboardLayoutComponentDimensions = useCallback((): void => {
    updateDashboardAppBarHeight();
    updateDashboardNavigationbarWidth();
  }, [updateDashboardAppBarHeight, updateDashboardNavigationbarWidth]);

  useEffect((): void => {
    appLogger.silly(`Updated Dashboard App Bar height: ${dashboardAppBarHeight.toString()}.`);
  }, [dashboardAppBarHeight]);

  useEffect((): void => {
    appLogger.silly(`Updated Drawer width: ${dashboardNavigationBarWidth.toString()}.`);
  }, [dashboardNavigationBarWidth]);

  useEffect((): void => {
    appLogger.info(`Dashboard navigation area changed: ${dashboardNavigationArea === null ? "null" : `"${dashboardNavigationArea}"`}.`);
  }, [dashboardNavigationArea]);

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

  useEffect((): void => {
    appLogger.debug("Rendering Dashboard Layout Root component.");
  }, []);

  return (
    <>
      <DashboardAppBar
        ref={dashboardAppBarRef}
        title={dashboardAppBarTitle}
        signedInUserId={signedInRootContext.signedInUserInfo.userId}
        dashboardNavigationArea={dashboardNavigationArea}
      />
      <DashboardNavigationBar
        ref={dashboardNavigationBarRef}
        width={dashboardNavigationBarWidth}
        heightOffset={dashboardAppBarHeight}
        signedInUserId={signedInRootContext.signedInUserInfo.userId}
        dashboardNavigationArea={dashboardNavigationArea}
      />
      <Box
        component="main"
        position="fixed"
        sx={{
          top: dashboardAppBarHeight, // Start right below the app bar
          left: dashboardNavigationBarWidth, // Adjust for the navigation bar
          right: 0, // Stretch to the right edge of the viewport
          bottom: 0, // Stretch to the bottom of the viewport
          overflow: "auto",
          padding: ".5rem"
        }}
      >
        <Outlet
          context={
            {
              ...signedInRootContext,
              appBarTitle: dashboardAppBarTitle,
              setAppBarTitle: setDashboardAppBarTitle, // TODO: Add breadcrumb here (conditionally)
              layout: {
                dashboardNavigationBarWidth: dashboardNavigationBarWidth,
                dashboardAppBarHeight: dashboardAppBarHeight
              },
              dashboardNavigationArea: dashboardNavigationArea,
              setDashboardNavigationArea: setDashboardNavigationArea
            } satisfies IDashboardLayoutRootContext
          }
        />
      </Box>
    </>
  );
};

export default DashboardLayoutRoot;
