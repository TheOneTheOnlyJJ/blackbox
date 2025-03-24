import { FC, useCallback, useEffect } from "react";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import NewUserDataStorageConfigFormDialog from "@renderer/components/dialogs/NewUserDataStorageConfigFormDialog";
import AvailableUserDataStorageConfigsDataGrid from "@renderer/components/dataGrids/AvailableUserDataStorageConfigsDataGrid";
import { Box, Stack, Typography } from "@mui/material";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { IUserDataLayoutRootContext, useUserDataLayoutRootContext } from "@renderer/components/roots/userDataLayoutRoot/UserDataLayoutRootContext";
import { USER_DATA_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";

const UserDataStorageConfigsPage: FC = () => {
  const userDataStoragesLayoutRootContext: IUserDataLayoutRootContext = useUserDataLayoutRootContext();

  const [isNewUserDataStorageConfigFormDialogOpen, setIsNewUserDataStorageConfigFormDialogOpen] = useDialogOpenState(
    appLogger,
    "new User Data Storage Config form"
  );

  const handleNewDataStorageConfigButtonClick = useCallback((): void => {
    appLogger.debug("New User Data Storage Config button clicked.");
    setIsNewUserDataStorageConfigFormDialogOpen(true);
  }, [setIsNewUserDataStorageConfigFormDialogOpen]);

  const handleNewUserDataStorageConfigFormDialogClose = useCallback((): void => {
    setIsNewUserDataStorageConfigFormDialogOpen(false);
  }, [setIsNewUserDataStorageConfigFormDialogOpen]);

  const handleSuccessfullyAddedNewUserDataStorageConfig = useCallback((): void => {
    handleNewUserDataStorageConfigFormDialogClose();
  }, [handleNewUserDataStorageConfigFormDialogClose]);

  useEffect((): void => {
    userDataStoragesLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.userData);
    userDataStoragesLayoutRootContext.setUserDataNavigationArea(USER_DATA_NAVIGATION_AREAS.storageConfigs);
    userDataStoragesLayoutRootContext.setAppBarTitle("Data Storage Configurations");
    userDataStoragesLayoutRootContext.setForbiddenLocationName("Data Storage Configurations");
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
          <Button variant="contained" size="large" onClick={handleNewDataStorageConfigButtonClick}>
            New data storage configuration
          </Button>
        </Stack>
        <Typography variant="h6" sx={{ marginTop: ".5rem" }}>
          Available data storage configurations:
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem" }}>
          <AvailableUserDataStorageConfigsDataGrid />
        </Box>
        {
          // TODO: Add edit config & delete config (with optional delete resources)
        }
      </Box>
      <NewUserDataStorageConfigFormDialog
        userIdToAddTo={userDataStoragesLayoutRootContext.signedInUserInfo.userId}
        onAddedSuccessfully={handleSuccessfullyAddedNewUserDataStorageConfig}
        open={isNewUserDataStorageConfigFormDialogOpen}
        onClose={handleNewUserDataStorageConfigFormDialogClose}
      />
    </>
  );
};

export default UserDataStorageConfigsPage;
