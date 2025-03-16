import { FC, MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import NewUserDataStorageConfigFormDialog from "@renderer/components/dialogs/NewUserDataStorageConfigFormDialog";
import UserDataStoragesDataGrid from "@renderer/components/dataGrids/UserDataStoragesDataGrid";
import { Box, Stack, Typography } from "@mui/material";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import {
  IUserDataStoragesLayoutRootContext,
  useUserDataStoragesLayoutRootContext
} from "@renderer/components/roots/userDataStoragesLayoutRoot/UserDataStoragesLayoutRootContext";
import { USER_DATA_STORAGES_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";

const UserDataStoragesPage: FC = () => {
  const userDataStoragesLayoutRootContext: IUserDataStoragesLayoutRootContext = useUserDataStoragesLayoutRootContext();
  const [isNewUserDataStorageConfigFormDialogOpen, setIsNewUserDataStorageConfigFormDialogOpen] = useState<boolean>(false);
  const isInitialMount: MutableRefObject<boolean> = useRef<boolean>(true);

  const handleNewDataStorageButtonClick = useCallback((): void => {
    appLogger.debug("New User Data Storage button clicked.");
    setIsNewUserDataStorageConfigFormDialogOpen(true);
  }, []);

  const handleNewUserDataStorageConfigFormDialogClose = useCallback((): void => {
    setIsNewUserDataStorageConfigFormDialogOpen(false);
  }, []);

  const handleSuccessfullyAddedNewUserDataStorageConfig = useCallback((): void => {
    handleNewUserDataStorageConfigFormDialogClose();
  }, [handleNewUserDataStorageConfigFormDialogClose]);

  useEffect((): void => {
    if (isInitialMount.current) {
      // Skip logging on the initial render
      isInitialMount.current = false;
      return;
    }
    appLogger.debug(`${isNewUserDataStorageConfigFormDialogOpen ? "Opened" : "Closed"} new User Data Storage Config form dialog.`);
  }, [isNewUserDataStorageConfigFormDialogOpen]);

  useEffect((): void => {
    userDataStoragesLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.userDataStorages);
    userDataStoragesLayoutRootContext.setUserStoragesNavigationArea(USER_DATA_STORAGES_NAVIGATION_AREAS.availableStorages);
    userDataStoragesLayoutRootContext.setAppBarTitle("Available Data Storages");
    userDataStoragesLayoutRootContext.setForbiddenLocationName("Available Data Storages");
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
          <Button variant="contained" size="large" onClick={handleNewDataStorageButtonClick}>
            New Data Storage
          </Button>
        </Stack>
        <Typography variant="h6" sx={{ marginTop: ".5rem" }}>
          Available Data Storages:
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem" }}>
          <UserDataStoragesDataGrid />
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

export default UserDataStoragesPage;
