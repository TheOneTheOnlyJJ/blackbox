import { FC, MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IDashboardLayoutRootContext, useDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { IUserDataLayoutRootContext } from "./UserDataLayoutRootContext";
import { appLogger } from "@renderer/utils/loggers";
import UserDataNavigationBar from "@renderer/components/navigation/UserDataNavigationBar";
import { UserDataNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";

const DEFAULT_USER_DATA_NAVIGATION_BAR_WIDTH = 240;

const UserDataLayoutRoot: FC = () => {
  const dashboardLayoutRootContext: IDashboardLayoutRootContext = useDashboardLayoutRootContext();
  const userDataNavigationBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [userDataNavigationBarWidth, setUserDataNavigationBarWidth] = useState<number>(DEFAULT_USER_DATA_NAVIGATION_BAR_WIDTH);
  const [userDataNavigationArea, setUserDataNavigationArea] = useState<UserDataNavigationArea | null>(null);

  const updateUserDataNavigationBarWidth = useCallback((): void => {
    if (userDataNavigationBarRef.current) {
      setUserDataNavigationBarWidth(userDataNavigationBarRef.current.clientWidth);
    }
  }, [userDataNavigationBarRef]);

  const updateUserDataLayoutComponentDimensions = useCallback((): void => {
    updateUserDataNavigationBarWidth();
  }, [updateUserDataNavigationBarWidth]);

  // Measure the necessary component dimensions
  useLayoutEffect((): (() => void) => {
    // Set initial dimensions
    updateUserDataLayoutComponentDimensions();
    // Add event listener for window resize
    window.addEventListener("resize", updateUserDataLayoutComponentDimensions);
    // Cleanup event listener on component unmount
    return (): void => {
      window.removeEventListener("resize", updateUserDataLayoutComponentDimensions);
    };
  }, [updateUserDataLayoutComponentDimensions]);

  useEffect((): void => {
    appLogger.info(`User data navigation area changed: ${userDataNavigationArea === null ? "null" : `"${userDataNavigationArea}"`}.`);
  }, [userDataNavigationArea]);

  useEffect((): void => {
    appLogger.debug("Rendering User Data Layout Root component.");
  }, []);

  return (
    <>
      <UserDataNavigationBar
        ref={userDataNavigationBarRef}
        width={userDataNavigationBarWidth}
        leftOffset={dashboardLayoutRootContext.layout.dashboardNavigationBarWidth}
        heightOffset={dashboardLayoutRootContext.layout.dashboardAppBarHeight}
        signedInUserId={dashboardLayoutRootContext.signedInUserInfo.userId}
        userDataNavigationArea={userDataNavigationArea}
      />
      <Box
        component="main"
        position="fixed"
        sx={{
          top: dashboardLayoutRootContext.layout.dashboardAppBarHeight, // Start right below the app bar
          left: dashboardLayoutRootContext.layout.dashboardNavigationBarWidth + userDataNavigationBarWidth, // Adjust for both navigation bars
          right: 0, // Stretch to the right edge of the viewport
          bottom: 0, // Stretch to the bottom of the viewport
          overflow: "auto",
          padding: ".5rem"
        }}
      >
        <Outlet
          context={
            {
              ...dashboardLayoutRootContext,
              layout: {
                ...dashboardLayoutRootContext.layout,
                userDataNavigationbarWidth: userDataNavigationBarWidth
              },
              userDataNavigationArea: userDataNavigationArea,
              setUserDataNavigationArea: setUserDataNavigationArea
            } satisfies IUserDataLayoutRootContext
          }
        />
      </Box>
    </>
  );
};

export default UserDataLayoutRoot;
