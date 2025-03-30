import { GridActionsCellItem } from "@mui/x-data-grid";
import { FC, useCallback } from "react";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";

export interface IStartUserDataStorageActionItemProps {
  logger: LogFunctions;
  key: string | number;
  dataStorage: { name: string; id: string };
  showInMenu: boolean;
}

const InitialiseUserDataStorageActionItem: FC<IStartUserDataStorageActionItemProps> = (props: IStartUserDataStorageActionItemProps) => {
  const { logger, key, dataStorage, showInMenu } = props;

  const handleOpenClick = useCallback((): void => {
    logger.info(`Clicked activate User Data Storage "${dataStorage.id}" action button.`);
    const INITIALISE_USER_DATA_STORAGE_RESPONSE: IPCAPIResponse<IEncryptedData<boolean>> = window.userDataStorageAPI.initialiseUserDataStorage(
      dataStorage.id
    );
    if (INITIALISE_USER_DATA_STORAGE_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      window.IPCTLSAPI.decryptAndValidateJSON<boolean>(
        INITIALISE_USER_DATA_STORAGE_RESPONSE.data,
        (data: unknown): data is boolean => {
          return typeof data === "boolean";
        },
        "User Data Storage initialisation result"
      )
        .then(
          (wasUserDataStorageInitialised: boolean): void => {
            if (wasUserDataStorageInitialised) {
              enqueueSnackbar({ message: `Activated ${dataStorage.name} data storage.`, variant: "info" });
            } else {
              enqueueSnackbar({ message: `Could not activate ${dataStorage.name} data storage.`, variant: "warning" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Storage initialisation result. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: `Error decrypting ${dataStorage.name} data storage activation result.`, variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt User Data Storage initialisation result. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: `Error decrypting ${dataStorage.name} data storage activation result.`, variant: "error" });
        });
    } else {
      logger.error(`Error initialising User Data Storage "${dataStorage.id}"!`);
      enqueueSnackbar({ message: `Error activating ${dataStorage.name} data storage.`, variant: "error" });
    }
  }, [logger, dataStorage]);

  return <GridActionsCellItem key={key} icon={<PowerOutlinedIcon />} onClick={handleOpenClick} label="Activate" showInMenu={showInMenu} />;
};

export default InitialiseUserDataStorageActionItem;
