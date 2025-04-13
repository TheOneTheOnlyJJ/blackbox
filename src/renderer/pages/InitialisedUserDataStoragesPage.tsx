import { Box, Typography } from "@mui/material";
import InitialisedUserDataStoragesDataGrid from "@renderer/components/dataGrids/InitialisedUserDataStoragesDataGrid";
import {
  IUserDataStoragesNavigationAreaLayoutRootContext,
  useUserDataStoragesNavigationAreaLayoutRootContext
} from "@renderer/components/roots/userDataStoragesNavigationAreaLayoutRoot/UserDataStoragesNavigationAreaLayoutRootContext";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { USER_DATA_STORAGES_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { FC, useEffect } from "react";

const InitialisedUserDataStoragesPage: FC = () => {
  const userDataStoragesNavigationAreaLayoutRootContext: IUserDataStoragesNavigationAreaLayoutRootContext =
    useUserDataStoragesNavigationAreaLayoutRootContext();

  useEffect((): void => {
    userDataStoragesNavigationAreaLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.dataStorages);
    userDataStoragesNavigationAreaLayoutRootContext.setUserDataStoragesNavigationArea(USER_DATA_STORAGES_NAVIGATION_AREAS.initialisedStorages);
    // userDataStoragesLayoutRootContext.setAppBarTitle("Active Data Storages");
    userDataStoragesNavigationAreaLayoutRootContext.setForbiddenLocationName("Active Data Storages");
  }, [userDataStoragesNavigationAreaLayoutRootContext]);

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
