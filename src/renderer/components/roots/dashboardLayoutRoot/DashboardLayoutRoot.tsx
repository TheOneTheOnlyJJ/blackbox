import Box from "@mui/material/Box/Box";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import DashboardAppBar from "@renderer/components/appBars/DashboardAppBar";
import DashboardNavigationBar from "@renderer/components/navigation/DashboardNavigationBar";
import { Outlet } from "react-router-dom";
import { appLogger } from "@renderer/utils/loggers";
import { IDashboardLayoutRootContext } from "./DashboardLayoutRootContext";
import { useDashboardNavigationAreaState } from "./hooks/useDashboardNavigationAreaState";
import { useDahsboardLayoutDimensionsState } from "./hooks/useDahsboardLayoutDimensionsState";

const DashboardLayoutRoot: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const dashboardAppBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const dashboardNavigationBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const { dashboardAppBarHeight, dashboardNavigationBarWidth } = useDahsboardLayoutDimensionsState(
    appLogger,
    dashboardAppBarRef,
    dashboardNavigationBarRef
  );
  const [dashboardAppBarTitle, setDashboardAppBarTitle] = useState<string>("");
  const [dashboardNavigationArea, setDashboardNavigationArea] = useDashboardNavigationAreaState(appLogger);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering Dashboard Layout Root component.");
    return (): void => {
      appLogger.debug("Removing Dashboard Layout Root component.");
    };
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
