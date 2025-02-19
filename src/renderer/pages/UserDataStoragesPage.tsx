import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  ISignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import NewUserDataStorageConfigFormDialog from "@renderer/components/dialogs/NewUserDataStorageConfigFormDialog";

const UserDataStoragesPage: FC = () => {
  const signedInDashboardLayoutRootContext: ISignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();
  // User data storage config form dialog
  const [isNewUserDataStorageConfigFormDialogOpen, setIsNewUserDataStorageConfigFormDialogOpen] = useState<boolean>(false);
  const isInitialMount = useRef(true);
  useEffect((): void => {
    if (isInitialMount.current) {
      // Skip logging on the initial render
      isInitialMount.current = false;
      return;
    }
    appLogger.debug(`${isNewUserDataStorageConfigFormDialogOpen ? "Opened" : "Closed"} new User Data Storage Config form dialog.`);
  }, [isNewUserDataStorageConfigFormDialogOpen]);

  const handleNewUserDataStorageConfigFormDialogClose = useCallback((): void => {
    setIsNewUserDataStorageConfigFormDialogOpen(false);
  }, []);

  const handleNewDataStorageButtonClick = useCallback((): void => {
    appLogger.debug("New User Data Storage button clicked.");
    setIsNewUserDataStorageConfigFormDialogOpen(true);
  }, []);

  useEffect((): void => {
    signedInDashboardLayoutRootContext.setAppBarTitle("Data Storages");
    signedInDashboardLayoutRootContext.setForbiddenLocationName("Data Storages");
  }, [signedInDashboardLayoutRootContext]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "lime"
        }}
      >
        <Typography variant="h5">Data Storages</Typography>
        <Button variant="contained" size="large" onClick={handleNewDataStorageButtonClick}>
          New Data Storage
        </Button>
      </Box>
      <NewUserDataStorageConfigFormDialog
        userIdToAddTo={signedInDashboardLayoutRootContext.currentlySignedInUser.userId}
        onAddedSuccessfully={handleNewUserDataStorageConfigFormDialogClose}
        open={isNewUserDataStorageConfigFormDialogOpen}
        onClose={handleNewUserDataStorageConfigFormDialogClose}
      />
    </>
  );
};

export default UserDataStoragesPage;
