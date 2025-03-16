import { FC, MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IDashboardLayoutRootContext, useDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { IUserDataStoragesLayoutRootContext } from "./UserDataStoragesLayoutRootContext";
import { appLogger } from "@renderer/utils/loggers";
import UserDataStoragesNavigationBar from "@renderer/components/navigation/UserDataStoragesNavigationBar";
import { UserDataStoragesNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";

const DEFAULT_USER_DATA_STORAGES_NAVIGATION_BAR_WIDTH = 240;

const UserDataStoragesLayoutRoot: FC = () => {
  const dashboardLayoutRootContext: IDashboardLayoutRootContext = useDashboardLayoutRootContext();
  const userDataStoragesNavigationBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [userDataStoragesNavigationBarWidth, setuserDataStoragesNavigationBarWidth] = useState<number>(
    DEFAULT_USER_DATA_STORAGES_NAVIGATION_BAR_WIDTH
  );
  const [userStoragesNavigationArea, setUserStoragesNavigationArea] = useState<UserDataStoragesNavigationArea | null>(null);

  const updateUserDataStoragesNavigationBarWidth = useCallback((): void => {
    if (userDataStoragesNavigationBarRef.current) {
      setuserDataStoragesNavigationBarWidth(userDataStoragesNavigationBarRef.current.clientWidth);
    }
  }, [userDataStoragesNavigationBarRef]);

  const updateUserDataStoragesLayoutComponentDimensions = useCallback((): void => {
    updateUserDataStoragesNavigationBarWidth();
  }, [updateUserDataStoragesNavigationBarWidth]);

  // Measure the necessary component dimensions
  useLayoutEffect((): (() => void) => {
    // Set initial dimensions
    updateUserDataStoragesLayoutComponentDimensions();
    // Add event listener for window resize
    window.addEventListener("resize", updateUserDataStoragesLayoutComponentDimensions);
    // Cleanup event listener on component unmount
    return (): void => {
      window.removeEventListener("resize", updateUserDataStoragesLayoutComponentDimensions);
    };
  }, [updateUserDataStoragesLayoutComponentDimensions]);

  useEffect((): void => {
    appLogger.info(
      `User data storages navigation area changed: ${userStoragesNavigationArea === null ? "null" : `"${userStoragesNavigationArea}"`}.`
    );
  }, [userStoragesNavigationArea]);

  useEffect((): void => {
    appLogger.debug("Rendering User Data Storages Layout Root component.");
  }, []);

  return (
    <>
      <UserDataStoragesNavigationBar
        ref={userDataStoragesNavigationBarRef}
        width={userDataStoragesNavigationBarWidth}
        leftOffset={dashboardLayoutRootContext.layout.dashboardNavigationBarWidth}
        heightOffset={dashboardLayoutRootContext.layout.dashboardAppBarHeight}
        signedInUserId={dashboardLayoutRootContext.signedInUserInfo.userId}
        userStoragesNavigationArea={userStoragesNavigationArea}
      />
      <Box
        component="main"
        position="fixed"
        sx={{
          top: dashboardLayoutRootContext.layout.dashboardAppBarHeight, // Start right below the app bar
          left: dashboardLayoutRootContext.layout.dashboardNavigationBarWidth + userDataStoragesNavigationBarWidth, // Adjust for both navigation bars
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
                userDataStoragesNavigationbarWidth: userDataStoragesNavigationBarWidth
              },
              userStoragesNavigationArea: userStoragesNavigationArea,
              setUserStoragesNavigationArea: setUserStoragesNavigationArea
            } satisfies IUserDataStoragesLayoutRootContext
          }
        />
      </Box>
    </>
  );
};

export default UserDataStoragesLayoutRoot;
