import { FC, MutableRefObject, useEffect, useRef } from "react";
import { IDashboardLayoutRootContext, useDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { IUserDataLayoutRootContext } from "./UserDataLayoutRootContext";
import { appLogger } from "@renderer/utils/loggers";
import UserDataNavigationBar from "@renderer/components/navigation/UserDataNavigationBar";
import { useUserDataNavigationAreaState } from "./hooks/useUserDataNavigationAreaState";
import { useUserDataLayoutDimensionsState } from "./hooks/useUserDataLayoutDimensionsState";

const UserDataLayoutRoot: FC = () => {
  const dashboardLayoutRootContext: IDashboardLayoutRootContext = useDashboardLayoutRootContext();
  const userDataNavigationBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const { userDataNavigationBarWidth } = useUserDataLayoutDimensionsState(appLogger, userDataNavigationBarRef);
  const [userDataNavigationArea, setUserDataNavigationArea] = useUserDataNavigationAreaState(appLogger);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering User Data Layout Root component.");
    return (): void => {
      appLogger.debug("Removing User Data Layout Root component.");
    };
  }, []);

  return (
    <>
      <UserDataNavigationBar
        ref={userDataNavigationBarRef}
        width={userDataNavigationBarWidth}
        leftOffset={0} //dashboardLayoutRootContext.layout.dashboardNavigationBarWidth}
        heightOffset={dashboardLayoutRootContext.layout.dashboardAppBarHeight}
        signedInUserId={dashboardLayoutRootContext.signedInUserInfo.userId}
        userDataNavigationArea={userDataNavigationArea}
      />
      <Box
        component="main"
        position="fixed"
        sx={{
          top: dashboardLayoutRootContext.layout.dashboardAppBarHeight, // Start right below the app bar
          left: 0 + userDataNavigationBarWidth, // dashboardLayoutRootContext.layout.dashboardNavigationBarWidth
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
