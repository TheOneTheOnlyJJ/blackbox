import { Button, Box, Stack, Typography } from "@mui/material";
import OpenUserDataStorageVisibilityGroupsDataGrid from "@renderer/components/dataGrids/OpenUserDataStorageVisibilityGroupsDataGrid";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { USER_DATA_STORAGES_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import {
  IUserDataStoragesNavigationAreaLayoutRootContext,
  useUserDataStoragesNavigationAreaLayoutRootContext
} from "@renderer/components/roots/userDataStoragesNavigationAreaLayoutRoot/UserDataStoragesNavigationAreaLayoutRootContext";
import { FC, useCallback, useEffect } from "react";
import { appLogger } from "@renderer/utils/loggers";
import NewUserDataStorageVisibilityGroupConfigFormDialog from "@renderer/components/dialogs/forms/user/data/storage/visibilityGroup/NewUserDataStorageVisibilityGroupConfigFormDialog";
import OpenUserDataStorageVisibilityGroupFormDialog from "@renderer/components/dialogs/forms/user/data/storage/visibilityGroup/OpenUserDataStorageVisibilityGroupFormDialog";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";

const UserDataStorageVisibilityGroupsPage: FC = () => {
  const userDataStoragesNavigationAreaLayoutRootContext: IUserDataStoragesNavigationAreaLayoutRootContext =
    useUserDataStoragesNavigationAreaLayoutRootContext();
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
    userDataStoragesNavigationAreaLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.dataStorages);
    userDataStoragesNavigationAreaLayoutRootContext.setUserDataStoragesNavigationArea(USER_DATA_STORAGES_NAVIGATION_AREAS.visibilityGroups);
    // userDataStoragesLayoutRootContext.setAppBarTitle("Data Storage Visibility Groups");
    userDataStoragesNavigationAreaLayoutRootContext.setForbiddenLocationName("Data Storage Visibility Groups");
  }, [userDataStoragesNavigationAreaLayoutRootContext]);

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
        <Stack direction="row" spacing={1}>
          <Button variant="contained" size="large" startIcon={<AddOutlinedIcon />} onClick={handleNewUserDataStorageVisibilityGroupConfigButtonClick}>
            New visibility group
          </Button>
          <Button variant="contained" size="large" startIcon={<LockOpenOutlinedIcon />} onClick={handleOpenUserDataStorageVisibilityGroupButtonClick}>
            Open visibility group
          </Button>
        </Stack>
        <Typography variant="h6" sx={{ marginTop: ".5rem" }}>
          Open visibility groups:
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem" }}>
          <OpenUserDataStorageVisibilityGroupsDataGrid />
        </Box>
      </Box>
      <NewUserDataStorageVisibilityGroupConfigFormDialog
        userIdToAddTo={userDataStoragesNavigationAreaLayoutRootContext.signedInUserInfo.userId}
        onAddedSuccessfully={handleSuccessfullyAddedNewUserDataStorageVisibilityGroupConfig}
        onOpenedSuccessfully={handleSuccessfullyOpenedNewlyAddedUserDataStorageVisibilityGroupConfig}
        open={isNewUserDataStorageVisibilityGroupConfigFormDialogOpen}
        onClose={handleNewUserDataStorageVisibilityGroupConfigFormDialogClose}
      />
      <OpenUserDataStorageVisibilityGroupFormDialog
        userIdToOpenFor={userDataStoragesNavigationAreaLayoutRootContext.signedInUserInfo.userId}
        onOpenedSuccessfully={handleSuccessfullyOpenedNewUserDataStorageVisibilityGroup}
        open={isOpenUserDataStorageVisibilityGroupFormDialogOpen}
        onClose={handleOpenUserDataStorageVisibilityGroupFormDialogClose}
      />
    </>
  );
};

export default UserDataStorageVisibilityGroupsPage;
