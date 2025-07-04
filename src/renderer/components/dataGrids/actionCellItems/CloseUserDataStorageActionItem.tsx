import { GridActionsCellItem } from "@mui/x-data-grid";
import { LogFunctions } from "electron-log";
import { FC, useCallback } from "react";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";

export interface ICloseUserDataStorageActionItemProps {
  logger: LogFunctions;
  key: string | number;
  dataStorage: { name: string; id: string };
  showInMenu: boolean;
}

const CloseUserDataStorageActionItem: FC<ICloseUserDataStorageActionItemProps> = (props: ICloseUserDataStorageActionItemProps) => {
  const { logger, key, dataStorage, showInMenu } = props;

  const handleCloseClick = useCallback((): void => {
    logger.info(`Clicked close User Data Storage "${dataStorage.id}" action button.`);
    const CLOSE_USER_DATA_STORAGE_RESPONSE: IPCAPIResponse<IEncryptedData<boolean>> = window.userDataStorageAPI.closeUserDataStorage(dataStorage.id);
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
              enqueueSnackbar({ message: `Closed ${dataStorage.name} data storage.`, variant: "info" });
            } else {
              enqueueSnackbar({ message: `Could not close ${dataStorage.name} data storage.`, variant: "warning" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Storage close result. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: `Error decrypting ${dataStorage.name} data storage close result.`, variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt User Data Storage close result. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: `Error decrypting ${dataStorage.name} data storage close result.`, variant: "error" });
        });
    } else {
      logger.error(`Error closing User Data Storage "${dataStorage.id}"!`);
      enqueueSnackbar({ message: `Error closing ${dataStorage.name} data storage.`, variant: "error" });
    }
  }, [logger, dataStorage]);

  return <GridActionsCellItem key={key} icon={<StopCircleOutlinedIcon />} onClick={handleCloseClick} label="Close" showInMenu={showInMenu} />;
};

export default CloseUserDataStorageActionItem;
