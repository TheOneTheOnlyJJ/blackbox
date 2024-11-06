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

// TODO: Rename this and everything related to "Stash"
const StashPage: FC = () => {
  const signedInDashboardLayoutRootContext: ISignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();
  // User data storage config form dialog
  const [isUserDataStorageConfigFormDialogOpen, setIsUserDataStorageConfigFormDialogOpen] = useState<boolean>(false);
  const handleUserDataStorageConfigFormDialoggClose = useCallback((): void => {
    setIsUserDataStorageConfigFormDialogOpen(false);
  }, []);

  const handleNewStashButtonClick = useCallback((): void => {
    appLogger.debug("New Stash button clicked.");
    setIsUserDataStorageConfigFormDialogOpen(true);
  }, []);

  useEffect(() => {
    signedInDashboardLayoutRootContext.setAppBarTitle("Stash");
    signedInDashboardLayoutRootContext.setForbiddenLocationName("Stash");
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
        <Typography variant="h5">Stash</Typography>
        <Button variant="contained" size="large" onClick={handleNewStashButtonClick}>
          New Stash
        </Button>
      </Box>
      <UserDataStorageConfigFormDialog open={isUserDataStorageConfigFormDialogOpen} onClose={handleUserDataStorageConfigFormDialoggClose} />
    </>
  );
};

export default StashPage;
