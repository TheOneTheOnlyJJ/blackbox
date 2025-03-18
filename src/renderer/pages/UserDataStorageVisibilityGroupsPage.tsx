import { Button, Box, Stack, Typography } from "@mui/material";
import UserDataStorageVisibilityGroupsDataGrid from "@renderer/components/dataGrids/UserDataStorageVisibilityGroupsDataGrid";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { USER_DATA_STORAGES_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import {
  IUserDataStoragesLayoutRootContext,
  useUserDataStoragesLayoutRootContext
} from "@renderer/components/roots/userDataStoragesLayoutRoot/UserDataStoragesLayoutRootContext";
import { FC, MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { appLogger } from "@renderer/utils/loggers";
import NewUserDataStorageVisibilityGroupConfigFormDialog from "@renderer/components/dialogs/NewUserDataStorageVisibilityGroupConfigFormDialog";
import OpenUserDataStorageVisibilityGroupFormDialog from "@renderer/components/dialogs/OpenUserDataStorageVisibilityGroupFormDialog";

const UserDataStorageVisibilityGroupsPage: FC = () => {
  const userDataStoragesLayoutRootContext: IUserDataStoragesLayoutRootContext = useUserDataStoragesLayoutRootContext();
  const [isNewUserDataStorageVisibilityGroupConfigFormDialogOpen, setIsNewUserDataStorageVisibilityGroupConfigFormDialogOpen] =
    useState<boolean>(false);
  const isInitialMountNew: MutableRefObject<boolean> = useRef<boolean>(true);
  const [isOpenUserDataStorageVisibilityGroupFormDialogOpen, setIsOpenUserDataStorageVisibilityGroupFormDialogOpen] = useState<boolean>(false);
  const isInitialMountOpen: MutableRefObject<boolean> = useRef<boolean>(true);

  // New visibility group
  const handleNewUserDataStorageVisibilityGroupConfigButtonClick = useCallback((): void => {
    appLogger.debug("New User Data Storage Visibility Group Config button clicked.");
    setIsNewUserDataStorageVisibilityGroupConfigFormDialogOpen(true);
  }, []);

  const handleNewUserDataStorageVisibilityGroupConfigFormDialogClose = useCallback((): void => {
    setIsNewUserDataStorageVisibilityGroupConfigFormDialogOpen(false);
  }, []);

  const handleSuccessfullyAddedNewUserDataStorageVisibilityGroupConfig = useCallback((): void => {
    handleNewUserDataStorageVisibilityGroupConfigFormDialogClose();
  }, [handleNewUserDataStorageVisibilityGroupConfigFormDialogClose]);

  const handleSuccessfullyOpenedNewlyAddedUserDataStorageVisibilityGroupConfig = useCallback((): void => {
    // No-op
  }, []);

  // Open visibility group
  const handleOpenUserDataStorageVisibilityGroupButtonClick = useCallback((): void => {
    appLogger.debug("Open User Data Storage Visibility Group button clicked.");
    setIsOpenUserDataStorageVisibilityGroupFormDialogOpen(true);
  }, []);

  const handleOpenUserDataStorageVisibilityGroupFormDialogClose = useCallback((): void => {
    setIsOpenUserDataStorageVisibilityGroupFormDialogOpen(false);
  }, []);

  const handleSuccessfullyOpenedNewUserDataStorageVisibilityGroup = useCallback((): void => {
    handleOpenUserDataStorageVisibilityGroupFormDialogClose();
  }, [handleOpenUserDataStorageVisibilityGroupFormDialogClose]);

  useEffect((): void => {
    if (isInitialMountNew.current) {
      // Skip logging on the initial render
      isInitialMountNew.current = false;
      return;
    }
    appLogger.debug(
      `${isNewUserDataStorageVisibilityGroupConfigFormDialogOpen ? "Opened" : "Closed"} New User Data Storage Visibility Group form dialog.`
    );
  }, [isNewUserDataStorageVisibilityGroupConfigFormDialogOpen]);

  useEffect((): void => {
    if (isInitialMountOpen.current) {
      // Skip logging on the initial render
      isInitialMountOpen.current = false;
      return;
    }
    appLogger.debug(
      `${isOpenUserDataStorageVisibilityGroupFormDialogOpen ? "Opened" : "Closed"} Open User Data Storage Visibility Group form dialog.`
    );
  }, [isOpenUserDataStorageVisibilityGroupFormDialogOpen]);

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
          <Button variant="contained" size="large" onClick={handleNewUserDataStorageVisibilityGroupConfigButtonClick}>
            New Visibility Group
          </Button>
          <Button variant="contained" size="large" onClick={handleOpenUserDataStorageVisibilityGroupButtonClick}>
            Open Visibility Group
          </Button>
        </Stack>
        <Typography variant="h6" sx={{ marginTop: ".5rem" }}>
          Open Visibility Groups:
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem", background: "yellow" }}>
          <UserDataStorageVisibilityGroupsDataGrid />
        </Box>
      </Box>
      <NewUserDataStorageVisibilityGroupConfigFormDialog
        userIdToAddTo={userDataStoragesLayoutRootContext.signedInUserInfo.userId}
        onAddedSuccessfully={handleSuccessfullyAddedNewUserDataStorageVisibilityGroupConfig}
        onOpenedSuccessfully={handleSuccessfullyOpenedNewlyAddedUserDataStorageVisibilityGroupConfig}
        open={isNewUserDataStorageVisibilityGroupConfigFormDialogOpen}
        onClose={handleNewUserDataStorageVisibilityGroupConfigFormDialogClose}
      />
      <OpenUserDataStorageVisibilityGroupFormDialog
        userIdToOpenFor={userDataStoragesLayoutRootContext.signedInUserInfo.userId}
        onOpenedSuccessfully={handleSuccessfullyOpenedNewUserDataStorageVisibilityGroup}
        open={isOpenUserDataStorageVisibilityGroupFormDialogOpen}
        onClose={handleOpenUserDataStorageVisibilityGroupFormDialogClose}
      />
    </>
  );
};

export default UserDataStorageVisibilityGroupsPage;
