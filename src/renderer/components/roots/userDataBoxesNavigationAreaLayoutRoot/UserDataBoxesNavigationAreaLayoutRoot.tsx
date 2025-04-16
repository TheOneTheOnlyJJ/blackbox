import { FC, MutableRefObject, useEffect, useRef } from "react";
import { IDashboardLayoutRootContext, useDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { appLogger } from "@renderer/utils/loggers";
import UserDataBoxesNavigationAreaBar from "@renderer/components/navigation/UserDataBoxesNavigationAreaBar";
import { IUserDataBoxesNavigationAreaLayoutRootContext } from "./UserDataBoxesNavigationAreaLayoutRootContext";
import { useUserDataBoxesNavigationAreaLayoutDimensionsState } from "./hooks/useUserDataBoxesNavigationAreaLayoutDimensionsState";
import { useUserDataBoxesNavigationAreaState } from "./hooks/useUserDataBoxesNavigationAreaState";

const UserDataBoxesNavigationAreaLayoutRoot: FC = () => {
  const dashboardLayoutRootContext: IDashboardLayoutRootContext = useDashboardLayoutRootContext();
  const userDataBoxesNavigationAreaBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const { userDataBoxesNavigationAreaBarWidth } = useUserDataBoxesNavigationAreaLayoutDimensionsState(appLogger, userDataBoxesNavigationAreaBarRef);
  const [userDataBoxesNavigationArea, setUserDataBoxesNavigationArea] = useUserDataBoxesNavigationAreaState(appLogger);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering User Data Boxes Navigation Area Layout Root component.");
    return (): void => {
      appLogger.debug("Removing User Data Boxes Navigation Area Layout Root component.");
    };
  }, []);

  return (
    <>
      <UserDataBoxesNavigationAreaBar
        ref={userDataBoxesNavigationAreaBarRef}
        width={userDataBoxesNavigationAreaBarWidth}
        leftOffset={0} //dashboardLayoutRootContext.layout.dashboardNavigationBarWidth}
        heightOffset={dashboardLayoutRootContext.layout.dashboardAppBarHeight}
        signedInUserId={dashboardLayoutRootContext.signedInUserInfo.userId}
        userDataBoxesNavigationArea={userDataBoxesNavigationArea}
      />
      <Box
        component="main"
        position="fixed"
        sx={{
          top: dashboardLayoutRootContext.layout.dashboardAppBarHeight, // Start right below the app bar
          left: 0 + userDataBoxesNavigationAreaBarWidth, // dashboardLayoutRootContext.layout.dashboardNavigationBarWidth
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
                userDataBoxesNavigationAreaBarWidth: userDataBoxesNavigationAreaBarWidth
              },
              userDataBoxesNavigationArea: userDataBoxesNavigationArea,
              setUserDataBoxesNavigationArea: setUserDataBoxesNavigationArea
            } satisfies IUserDataBoxesNavigationAreaLayoutRootContext
          }
        />
      </Box>
    </>
  );
};

export default UserDataBoxesNavigationAreaLayoutRoot;
