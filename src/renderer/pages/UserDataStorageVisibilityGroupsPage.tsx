import { Button, Box, Stack, Typography } from "@mui/material";
import UserDataStorageVisibilityGroupsDataGrid from "@renderer/components/dataGrids/UserDataStorageVisibilityGroupsDataGrid";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { USER_DATA_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import {
  IUserDataStoragesLayoutRootContext,
  useUserDataStoragesLayoutRootContext
} from "@renderer/components/roots/userDataStoragesLayoutRoot/UserDataStoragesLayoutRootContext";
import { FC, useCallback, useEffect } from "react";
import { appLogger } from "@renderer/utils/loggers";
import NewUserDataStorageVisibilityGroupConfigFormDialog from "@renderer/components/dialogs/NewUserDataStorageVisibilityGroupConfigFormDialog";
import OpenUserDataStorageVisibilityGroupFormDialog from "@renderer/components/dialogs/OpenUserDataStorageVisibilityGroupFormDialog";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";

const UserDataStorageVisibilityGroupsPage: FC = () => {
  const userDataStoragesLayoutRootContext: IUserDataStoragesLayoutRootContext = useUserDataStoragesLayoutRootContext();
  const [isNewUserDataStorageVisibilityGroupConfigFormDialogOpen, setIsNewUserDataStorageVisibilityGroupConfigFormDialogOpen] = useDialogOpenState(
    appLogger,
    "new User Data Storage Visibility Group Config form"
  );
  const [isOpenUserDataStorageVisibilityGroupFormDialogOpen, setIsOpenUserDataStorageVisibilityGroupFormDialogOpen] = useDialogOpenState(
    appLogger,
    "open User Data Storage Visibility Group form"
  );

  // New visibility group
  const handleNewUserDataStorageVisibilityGroupConfigButtonClick = useCallback((): void => {
    appLogger.debug("New User Data Storage Visibility Group Config button clicked.");
    setIsNewUserDataStorageVisibilityGroupConfigFormDialogOpen(true);
  }, [setIsNewUserDataStorageVisibilityGroupConfigFormDialogOpen]);

  const handleNewUserDataStorageVisibilityGroupConfigFormDialogClose = useCallback((): void => {
    setIsNewUserDataStorageVisibilityGroupConfigFormDialogOpen(false);
  }, [setIsNewUserDataStorageVisibilityGroupConfigFormDialogOpen]);

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
  }, [setIsOpenUserDataStorageVisibilityGroupFormDialogOpen]);

  const handleOpenUserDataStorageVisibilityGroupFormDialogClose = useCallback((): void => {
    setIsOpenUserDataStorageVisibilityGroupFormDialogOpen(false);
  }, [setIsOpenUserDataStorageVisibilityGroupFormDialogOpen]);

  const handleSuccessfullyOpenedNewUserDataStorageVisibilityGroup = useCallback((): void => {
    handleOpenUserDataStorageVisibilityGroupFormDialogClose();
  }, [handleOpenUserDataStorageVisibilityGroupFormDialogClose]);

  useEffect((): void => {
    userDataStoragesLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.userDataStorages);
    userDataStoragesLayoutRootContext.setUserStoragesNavigationArea(USER_DATA_NAVIGATION_AREAS.visibilityGroups);
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
