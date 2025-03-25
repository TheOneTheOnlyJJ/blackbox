import { Box, Typography } from "@mui/material";
import { IUserDataLayoutRootContext, useUserDataLayoutRootContext } from "@renderer/components/roots/userDataLayoutRoot/UserDataLayoutRootContext";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { USER_DATA_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { FC, useEffect } from "react";

const ActiveUserDataStoragesPage: FC = () => {
  const userDataStoragesLayoutRootContext: IUserDataLayoutRootContext = useUserDataLayoutRootContext();

  useEffect((): void => {
    userDataStoragesLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.userData);
    userDataStoragesLayoutRootContext.setUserDataNavigationArea(USER_DATA_NAVIGATION_AREAS.activeStorages);
    userDataStoragesLayoutRootContext.setAppBarTitle("Active Data Storages");
    userDataStoragesLayoutRootContext.setForbiddenLocationName("Active Data Storages");
  }, [userDataStoragesLayoutRootContext]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%"
      }}
    >
      <Typography>ACTIVE DATA STORAGES PAGE</Typography>
      <Typography>Content will go here</Typography>
    </Box>
  );
};
export default ActiveUserDataStoragesPage;
