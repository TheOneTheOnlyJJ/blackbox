import { Button, Box, Stack } from "@mui/material";
import UserDataStorageVisibilityGroupsDataGrid from "@renderer/components/grids/UserDataStorageVisibilityGroupsDataGrid";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { USER_DATA_STORAGES_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import {
  IUserDataStoragesLayoutRootContext,
  useUserDataStoragesLayoutRootContext
} from "@renderer/components/roots/userDataStoragesLayoutRoot/UserDataStoragesLayoutRootContext";
import { FC, useEffect } from "react";

const UserDataStorageVisibilityGroupsPage: FC = () => {
  const userDataStoragesLayoutRootContext: IUserDataStoragesLayoutRootContext = useUserDataStoragesLayoutRootContext();

  useEffect((): void => {
    userDataStoragesLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.userDataStorages);
    userDataStoragesLayoutRootContext.setUserStoragesNavigationArea(USER_DATA_STORAGES_NAVIGATION_AREAS.visibilityGroups);
    userDataStoragesLayoutRootContext.setAppBarTitle("Data Storage Visibility Groups");
    userDataStoragesLayoutRootContext.setForbiddenLocationName("Data Storage Visibility Groups");
  }, [userDataStoragesLayoutRootContext]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%"
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button variant="contained" size="large">
            New Visibility Group
          </Button>
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem", background: "yellow" }}>
          <UserDataStorageVisibilityGroupsDataGrid />
        </Box>
      </Box>
    </>
  );
};

export default UserDataStorageVisibilityGroupsPage;
