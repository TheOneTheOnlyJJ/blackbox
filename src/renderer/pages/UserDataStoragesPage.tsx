import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  ISignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import UserDataStorageConfigFormDialog from "@renderer/components/dialogs/UserDataStorageConfigFormDialog";
import { IChangeEvent } from "@rjsf/core";
import { IUserDataStorageConfigWithMetadataInputData } from "@shared/user/data/storage/inputData/UserDataStorageConfigWithMetadataInputData";
import { enqueueSnackbar } from "notistack";
import { encrypt } from "@renderer/utils/encryption/encrypt";
import { EncryptedNewUserDataStorageConfigWithMetadataDTO } from "@shared/user/account/encrypted/EncryptedNewUserDataStorageConfigWithMetadataDTO";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { INewUserDataStorageConfigWithMetadataDTO } from "@shared/user/data/storage/NewUserDataStorageConfigWithMetadataDTO";

const UserDataStoragesPage: FC = () => {
  const signedInDashboardLayoutRootContext: ISignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();
  // User data storage config form dialog
  const [isUserDataStorageConfigFormDialogOpen, setIsUserDataStorageConfigFormDialogOpen] = useState<boolean>(false);
  const isInitialMount = useRef(true);
  useEffect((): void => {
    if (isInitialMount.current) {
      // Skip logging on the initial render
      isInitialMount.current = false;
      return;
    }
    appLogger.debug(`${isUserDataStorageConfigFormDialogOpen ? "Opened" : "Closed"} User Data Storage config form dialog.`);
  }, [isUserDataStorageConfigFormDialogOpen]);

  const handleUserDataStorageConfigFormDialogClose = useCallback((): void => {
    setIsUserDataStorageConfigFormDialogOpen(false);
  }, []);

  const handleNewDataStorageButtonClick = useCallback((): void => {
    appLogger.debug("New Data Storage button clicked.");
    setIsUserDataStorageConfigFormDialogOpen(true);
  }, []);

  const handleUserDataStorageFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataStorageConfigWithMetadataInputData>): void => {
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Storage Config with metadata input data form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      if (signedInDashboardLayoutRootContext.rendererProcessAESKey === null) {
        appLogger.error("Null AES encryption key. Cannot encrypt User Data Storage config with metadata input data. No-op.");
        enqueueSnackbar({ message: "Missing encryption key.", variant: "error" });
        return;
      }
      const NEW_USER_DATA_STORAGE_CONFIG_WITH_METADATA_DTO: INewUserDataStorageConfigWithMetadataDTO = {
        userId: signedInDashboardLayoutRootContext.currentlySignedInUser.userId,
        userDataStorageConfigWithMetadataInputData: data.formData
      };
      encrypt(JSON.stringify(NEW_USER_DATA_STORAGE_CONFIG_WITH_METADATA_DTO), signedInDashboardLayoutRootContext.rendererProcessAESKey)
        .then(
          (encryptedNewUserDataStorageConfigWithMetadataDTO: EncryptedNewUserDataStorageConfigWithMetadataDTO): void => {
            appLogger.debug("Done encrypting User Data Storage config with metadata input data.");
            const ADD_NEW_USER_DATA_STORAGE_CONFIG_WITH_METADATA_TO_USER_RESPONSE: IPCAPIResponse<boolean> =
              window.userAPI.addNewUserDataStorageConfigWithMetadataToUser(encryptedNewUserDataStorageConfigWithMetadataDTO);
            if (ADD_NEW_USER_DATA_STORAGE_CONFIG_WITH_METADATA_TO_USER_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
              if (ADD_NEW_USER_DATA_STORAGE_CONFIG_WITH_METADATA_TO_USER_RESPONSE.data) {
                enqueueSnackbar({ message: "New Data Storage config added successfully.", variant: "success" });
              } else {
                enqueueSnackbar({ message: "Could not add New User Data Storage config.", variant: "error" });
              }
            } else {
              enqueueSnackbar({ message: "Error adding New User Data Storage config.", variant: "error" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt new User Data Storage config with metadata input data. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "User Data Storage config encryption error.", variant: "error" });
          }
        )
        .catch((err: unknown): void => {
          const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
          appLogger.error(`Could not encrypt new User Data Storage config with metadata input data. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "User Data Storage config encryption error.", variant: "error" });
        })
        .finally((): void => {
          handleUserDataStorageConfigFormDialogClose();
        });
    },
    [
      signedInDashboardLayoutRootContext.currentlySignedInUser.userId,
      signedInDashboardLayoutRootContext.rendererProcessAESKey,
      handleUserDataStorageConfigFormDialogClose
    ]
  );

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
      <UserDataStorageConfigFormDialog
        open={isUserDataStorageConfigFormDialogOpen}
        handleFormSubmit={handleUserDataStorageFormSubmit}
        onClose={handleUserDataStorageConfigFormDialogClose}
      />
    </>
  );
};

export default UserDataStoragesPage;
