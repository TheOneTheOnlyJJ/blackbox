import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  ISignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import NewUserDataStorageConfigFormDialog from "@renderer/components/dialogs/NewUserDataStorageConfigFormDialog";
import { IPublicUserDataStorageConfig } from "@shared/user/data/storage/PublicUserDataStorageConfig";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";

const UserDataStoragesPage: FC = () => {
  const signedInDashboardLayoutRootContext: ISignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();
  // User data storage config form dialog
  const [isNewUserDataStorageConfigFormDialogOpen, setIsNewUserDataStorageConfigFormDialogOpen] = useState<boolean>(false);
  const isInitialMount: MutableRefObject<boolean> = useRef<boolean>(true);
  // Public User Data Storage Configs
  // TODO: Make this available in signedInContext instead of here
  const [publicUserDataStorageConfigs, setPublicUserDataStorageConfigs] = useState<IPublicUserDataStorageConfig[]>([]);

  const getAllSignedInUserUserDataStorageConfigs = useCallback((): void => {
    const GET_ALL_SIGNED_IN_USER_USER_DATA_STORAGE_CONFIGS: IPCAPIResponse<IPublicUserDataStorageConfig[]> =
      window.userAPI.getAllSignedInUserUserDataStorageConfigs();
    if (GET_ALL_SIGNED_IN_USER_USER_DATA_STORAGE_CONFIGS.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      appLogger.error(
        `Could not get all signed in user User Data Storage Configs! Reason: ${GET_ALL_SIGNED_IN_USER_USER_DATA_STORAGE_CONFIGS.error}!`
      );
      enqueueSnackbar({ message: "Error getting Data Storage configurations.", variant: "error" });
      return;
    }
    setPublicUserDataStorageConfigs(GET_ALL_SIGNED_IN_USER_USER_DATA_STORAGE_CONFIGS.data);
  }, []);

  const handleNewDataStorageButtonClick = useCallback((): void => {
    appLogger.debug("New User Data Storage button clicked.");
    setIsNewUserDataStorageConfigFormDialogOpen(true);
  }, []);

  const handleNewUserDataStorageConfigFormDialogClose = useCallback((): void => {
    setIsNewUserDataStorageConfigFormDialogOpen(false);
  }, []);

  const handleSuccessfullyAddedNewUserDataStorageConfig = useCallback((): void => {
    getAllSignedInUserUserDataStorageConfigs();
    handleNewUserDataStorageConfigFormDialogClose();
  }, [getAllSignedInUserUserDataStorageConfigs, handleNewUserDataStorageConfigFormDialogClose]);

  useEffect((): void => {
    if (isInitialMount.current) {
      // Skip logging on the initial render
      isInitialMount.current = false;
      return;
    }
    appLogger.debug(`${isNewUserDataStorageConfigFormDialogOpen ? "Opened" : "Closed"} new User Data Storage Config form dialog.`);
  }, [isNewUserDataStorageConfigFormDialogOpen]);

  useEffect((): void => {
    signedInDashboardLayoutRootContext.setAppBarTitle("Data Storages");
    signedInDashboardLayoutRootContext.setForbiddenLocationName("Data Storages");
  }, [signedInDashboardLayoutRootContext]);

  useEffect((): void => {
    getAllSignedInUserUserDataStorageConfigs();
  }, [getAllSignedInUserUserDataStorageConfigs]);

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
        <Typography>{JSON.stringify(publicUserDataStorageConfigs, null, 2)}</Typography>{" "}
        {
          // TODO Make this a proper MUI X Data Grid & Clear logs by making them optional
          // TODO: Add edit config & delete config (with optional delete resources)
        }
      </Box>
      <NewUserDataStorageConfigFormDialog
        userIdToAddTo={signedInDashboardLayoutRootContext.signedInUser.userId}
        onAddedSuccessfully={handleSuccessfullyAddedNewUserDataStorageConfig}
        open={isNewUserDataStorageConfigFormDialogOpen}
        onClose={handleNewUserDataStorageConfigFormDialogClose}
      />
    </>
  );
};

export default UserDataStoragesPage;
