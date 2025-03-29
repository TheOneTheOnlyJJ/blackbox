import { GridActionsCellItem } from "@mui/x-data-grid";
import { FC, useCallback } from "react";
import { LogFunctions } from "electron-log";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import PowerOffOutlinedIcon from "@mui/icons-material/PowerOffOutlined";

export interface ITerminateUserDataStorageActionItemProps {
  logger: LogFunctions;
  key: string | number;
  userDataStorageInfo: IUserDataStorageInfo;
}

const TerminateUserDataStorageActionItem: FC<ITerminateUserDataStorageActionItemProps> = (props: ITerminateUserDataStorageActionItemProps) => {
  const { logger, key, userDataStorageInfo } = props;

  const handleTerminateClick = useCallback((): void => {
    logger.info(`Clicked terminate User Data Storage "${userDataStorageInfo.name}" action button.`);
    const TERMINATE_USER_DATA_STORAGE_RESPONSE: IPCAPIResponse<IEncryptedData<boolean>> = window.userDataStorageAPI.terminateUserDataStorage(
      userDataStorageInfo.storageId
    );
    if (TERMINATE_USER_DATA_STORAGE_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      window.IPCTLSAPI.decryptAndValidateJSON<boolean>(
        TERMINATE_USER_DATA_STORAGE_RESPONSE.data,
        (data: unknown): data is boolean => {
          return typeof data === "boolean";
        },
        "User Data Storage terminate result"
      )
        .then(
          (wasUserDataStorageTerminated: boolean): void => {
            if (wasUserDataStorageTerminated) {
              enqueueSnackbar({ message: `Deactivated ${userDataStorageInfo.name} data storage.`, variant: "info" });
            } else {
              enqueueSnackbar({ message: `Could not deactivate ${userDataStorageInfo.name} data storage.`, variant: "warning" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Storage termination result. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: `Error decrypting ${userDataStorageInfo.name} data storage deactivation result.`, variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt User Data Storage termination result. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: `Error decrypting ${userDataStorageInfo.name} data storage deactivation result.`, variant: "error" });
        });
    } else {
      logger.error(`Error terminating User Data Storage "${userDataStorageInfo.storageId}"!`);
      enqueueSnackbar({ message: `Error deactivating ${userDataStorageInfo.name} data storage.`, variant: "error" });
    }
  }, [logger, userDataStorageInfo]);

  return (
    <GridActionsCellItem
      key={key}
      icon={<PowerOffOutlinedIcon />}
      onClick={handleTerminateClick}
      label={`Deactivate ${userDataStorageInfo.name} data storage`}
    />
  );
};

export default TerminateUserDataStorageActionItem;
