import { GridActionsCellItem } from "@mui/x-data-grid";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
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
  userDataStorageInfo: IUserDataStorageInfo;
  showInMenu: boolean;
}

const OpenUserDataStorageActionItem: FC<IOpenUserDataStorageActionItemProps> = (props: IOpenUserDataStorageActionItemProps) => {
  const { logger, key, userDataStorageInfo, showInMenu } = props;

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

  return <GridActionsCellItem key={key} icon={<PlayCircleOutlineOutlinedIcon />} onClick={handleOpenClick} label="Open" showInMenu={showInMenu} />;
};

export default OpenUserDataStorageActionItem;
