import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useCallback, useEffect, useState } from "react";
import {
  ISignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import UserDataStorageConfigFormDialog from "@renderer/components/dialogs/UserDataStorageConfigFormDialog";

const UserDataStoragesPage: FC = () => {
  const signedInDashboardLayoutRootContext: ISignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();
  // User data storage config form dialog
  const [isUserDataStorageConfigFormDialogOpen, setIsUserDataStorageConfigFormDialogOpen] = useState<boolean>(false);
  useEffect((): void => {
    appLogger.debug(`${isUserDataStorageConfigFormDialogOpen ? "Opened" : "Closed"} User Data Storage config form dialog.`);
  }, [isUserDataStorageConfigFormDialogOpen]);

  const handleUserDataStorageConfigFormDialoggClose = useCallback((): void => {
    setIsUserDataStorageConfigFormDialogOpen(false);
  }, []);

  const handleNewDataStorageButtonClick = useCallback((): void => {
    appLogger.debug("New Data Storage button clicked.");
    setIsUserDataStorageConfigFormDialogOpen(true);
  }, []);

  useEffect(() => {
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
      <UserDataStorageConfigFormDialog open={isUserDataStorageConfigFormDialogOpen} onClose={handleUserDataStorageConfigFormDialoggClose} />
    </>
  );
};

export default UserDataStoragesPage;
