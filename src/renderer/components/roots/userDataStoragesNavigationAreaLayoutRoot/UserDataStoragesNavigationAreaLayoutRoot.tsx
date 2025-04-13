import { FC, MutableRefObject, useEffect, useRef } from "react";
import { IDashboardLayoutRootContext, useDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { IUserDataStoragesNavigationAreaLayoutRootContext } from "./UserDataStoragesNavigationAreaLayoutRootContext";
import { appLogger } from "@renderer/utils/loggers";
import UserDataStoragesNavigationAreaBar from "@renderer/components/navigation/UserDataStoragesNavigationAreaBar";
import { useUserDataStoragesNavigationAreaState } from "./hooks/useUserDataStoragesNavigationAreaState";
import { useUserDataStoragesNavigationAreaLayoutDimensionsState } from "./hooks/useUserDataStoragesNavigationAreaLayoutDimensionsState";

const UserDataStoragesNavigationAreaLayoutRoot: FC = () => {
  const dashboardLayoutRootContext: IDashboardLayoutRootContext = useDashboardLayoutRootContext();
  const userDataStoragesNavigationAreaBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const { userDataStoragesNavigationAreaBarWidth } = useUserDataStoragesNavigationAreaLayoutDimensionsState(
    appLogger,
    userDataStoragesNavigationAreaBarRef
  );
  const [userDataStoragesNavigationArea, setUserDataStoragesNavigationArea] = useUserDataStoragesNavigationAreaState(appLogger);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering User Data Layout Root component.");
    return (): void => {
      appLogger.debug("Removing User Data Layout Root component.");
    };
  }, []);

  return (
    <>
      <UserDataStoragesNavigationAreaBar
        ref={userDataStoragesNavigationAreaBarRef}
        width={userDataStoragesNavigationAreaBarWidth}
        leftOffset={0} //dashboardLayoutRootContext.layout.dashboardNavigationBarWidth}
        heightOffset={dashboardLayoutRootContext.layout.dashboardAppBarHeight}
        signedInUserId={dashboardLayoutRootContext.signedInUserInfo.userId}
        userDataStoragesNavigationArea={userDataStoragesNavigationArea}
      />
      <Box
        component="main"
        position="fixed"
        sx={{
          top: dashboardLayoutRootContext.layout.dashboardAppBarHeight, // Start right below the app bar
          left: 0 + userDataStoragesNavigationAreaBarWidth, // dashboardLayoutRootContext.layout.dashboardNavigationBarWidth
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
                userDataStoragesNavigationAreaBarWidth: userDataStoragesNavigationAreaBarWidth
              },
              userDataStoragesNavigationArea: userDataStoragesNavigationArea,
              setUserDataStoragesNavigationArea: setUserDataStoragesNavigationArea
            } satisfies IUserDataStoragesNavigationAreaLayoutRootContext
          }
        />
      </Box>
    </>
  );
};

export default UserDataStoragesNavigationAreaLayoutRoot;
