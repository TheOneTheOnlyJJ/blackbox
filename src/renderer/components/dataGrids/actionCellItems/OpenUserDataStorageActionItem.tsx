import { GridActionsCellItem } from "@mui/x-data-grid";
import { LogFunctions } from "electron-log";
import { FC, useCallback } from "react";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";

export interface IOpenUserDataStorageActionItemProps {
  logger: LogFunctions;
  key: string | number;
  dataStorage: { name: string; id: string };
  showInMenu: boolean;
}

const OpenUserDataStorageActionItem: FC<IOpenUserDataStorageActionItemProps> = (props: IOpenUserDataStorageActionItemProps) => {
  const { logger, key, dataStorage, showInMenu } = props;

  const handleOpenClick = useCallback((): void => {
    logger.info(`Clicked open User Data Storage "${dataStorage.id}" action button.`);
    const OPEN_USER_DATA_STORAGE_RESPONSE: IPCAPIResponse<IEncryptedData<boolean>> = window.userDataStorageAPI.openUserDataStorage(dataStorage.id);
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
              enqueueSnackbar({ message: `Opened ${dataStorage.name} data storage.`, variant: "info" });
            } else {
              enqueueSnackbar({ message: `Could not open ${dataStorage.name} data storage.`, variant: "warning" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Storage open result. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: `Error decrypting ${dataStorage.name} data storage open result.`, variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt User Data Storage open result. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: `Error decrypting ${dataStorage.name} data storage open result.`, variant: "error" });
        });
    } else {
      logger.error(`Error opening User Data Storage "${dataStorage.id}"!`);
      enqueueSnackbar({ message: `Error opening ${dataStorage.name} data storage.`, variant: "error" });
    }
  }, [logger, dataStorage]);

  return <GridActionsCellItem key={key} icon={<PlayCircleOutlineOutlinedIcon />} onClick={handleOpenClick} label="Open" showInMenu={showInMenu} />;
};

export default OpenUserDataStorageActionItem;
