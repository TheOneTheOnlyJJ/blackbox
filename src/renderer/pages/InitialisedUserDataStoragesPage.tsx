import { Box, Typography } from "@mui/material";
import InitialisedUserDataStoragesDataGrid from "@renderer/components/dataGrids/InitialisedUserDataStoragesDataGrid";
import { IUserDataLayoutRootContext, useUserDataLayoutRootContext } from "@renderer/components/roots/userDataLayoutRoot/UserDataLayoutRootContext";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { USER_DATA_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { FC, useEffect } from "react";

const InitialisedUserDataStoragesPage: FC = () => {
  const userDataStoragesLayoutRootContext: IUserDataLayoutRootContext = useUserDataLayoutRootContext();

  useEffect((): void => {
    userDataStoragesLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.dataStorages);
    userDataStoragesLayoutRootContext.setUserDataNavigationArea(USER_DATA_NAVIGATION_AREAS.initialisedStorages);
    // userDataStoragesLayoutRootContext.setAppBarTitle("Active Data Storages");
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
      <Typography variant="h6">Active data storages:</Typography>
      <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem" }}>
        <InitialisedUserDataStoragesDataGrid />
      </Box>
    </Box>
  );
};

export default InitialisedUserDataStoragesPage;
