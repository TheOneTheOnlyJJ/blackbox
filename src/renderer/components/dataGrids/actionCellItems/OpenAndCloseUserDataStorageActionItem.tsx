import { GridActionsCellItem } from "@mui/x-data-grid";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { LogFunctions } from "electron-log";
import { FC, useCallback } from "react";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";

export interface IOpenAndCloseUserDataStorageActionItemProps {
  logger: LogFunctions;
  keys: {
    open: string | number;
    close: string | number;
  };
  userDataStorageInfo: IUserDataStorageInfo;
}

const OpenAndCloseUserDataStorageActionItem: FC<IOpenAndCloseUserDataStorageActionItemProps> = (
  props: IOpenAndCloseUserDataStorageActionItemProps
) => {
  const { logger, keys, userDataStorageInfo } = props;

  const handleOpenClick = useCallback((): void => {
    logger.info(`Clicked open User Data Storage "${userDataStorageInfo.storageId}" action button.`);
    const OPEN_USER_DATA_STORAGE_RESPONSE: IPCAPIResponse<IEncryptedData<boolean>> = window.userDataStorageAPI.openUserDataStorage(
      userDataStorageInfo.storageId
    );
    if (OPEN_USER_DATA_STORAGE_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      window.IPCTLSAPI.decryptAndValidateJSON<boolean>(
        OPEN_USER_DATA_STORAGE_RESPONSE.data,
        (data: unknown): data is boolean => {
          return typeof data === "boolean";
        },
        "User Data Storage open result"
      )
        .then(
          (wasUserDataStorageOpened: boolean): void => {
            if (wasUserDataStorageOpened) {
              enqueueSnackbar({ message: `Opened ${userDataStorageInfo.name} data storage.`, variant: "info" });
            } else {
              enqueueSnackbar({ message: `Could not open ${userDataStorageInfo.name} data storage.`, variant: "warning" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Storage open result. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: `Error decrypting ${userDataStorageInfo.name} data storage open result.`, variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt User Data Storage open result. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: `Error decrypting ${userDataStorageInfo.name} data storage open result.`, variant: "error" });
        });
    } else {
      logger.error(`Error opening User Data Storage "${userDataStorageInfo.storageId}"!`);
      enqueueSnackbar({ message: `Error opening ${userDataStorageInfo.name} data storage.`, variant: "error" });
    }
  }, [logger, userDataStorageInfo]);

  const handleCloseClick = useCallback((): void => {
    logger.info(`Clicked close User Data Storage "${userDataStorageInfo.storageId}" action button.`);
    const CLOSE_USER_DATA_STORAGE_RESPONSE: IPCAPIResponse<IEncryptedData<boolean>> = window.userDataStorageAPI.closeUserDataStorage(
      userDataStorageInfo.storageId
    );
    if (CLOSE_USER_DATA_STORAGE_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      window.IPCTLSAPI.decryptAndValidateJSON<boolean>(
        CLOSE_USER_DATA_STORAGE_RESPONSE.data,
        (data: unknown): data is boolean => {
          return typeof data === "boolean";
        },
        "User Data Storage close result"
      )
        .then(
          (wasUserDataStorageClosed: boolean): void => {
            if (wasUserDataStorageClosed) {
              enqueueSnackbar({ message: `Closed ${userDataStorageInfo.name} data storage.`, variant: "info" });
            } else {
              enqueueSnackbar({ message: `Could not close ${userDataStorageInfo.name} data storage.`, variant: "warning" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Storage close result. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: `Error decrypting ${userDataStorageInfo.name} data storage close result.`, variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt User Data Storage close result. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: `Error decrypting ${userDataStorageInfo.name} data storage close result.`, variant: "error" });
        });
    } else {
      logger.error(`Error closing User Data Storage "${userDataStorageInfo.storageId}"!`);
      enqueueSnackbar({ message: `Error closing ${userDataStorageInfo.name} data storage.`, variant: "error" });
    }
  }, [logger, userDataStorageInfo]);

  return userDataStorageInfo.backend.isOpen ? (
    <GridActionsCellItem
      key={keys.close}
      icon={<StopCircleOutlinedIcon />}
      onClick={handleCloseClick}
      label={`Close ${userDataStorageInfo.name} data storage`}
    />
  ) : (
    <GridActionsCellItem
      key={keys.open}
      icon={<PlayCircleOutlineOutlinedIcon />}
      onClick={handleOpenClick}
      label={`Open ${userDataStorageInfo.name} data storage`}
    />
  );
};

export default OpenAndCloseUserDataStorageActionItem;
