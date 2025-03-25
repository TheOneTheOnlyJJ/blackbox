import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

export const useUserAccountStorageInfoState = (logger: LogFunctions): IUserAccountStorageInfo | null => {
  const [userAccountStorageInfo, setUserAccountStorageInfo] = useState<IUserAccountStorageInfo | null>(null);

  useEffect((): void => {
    logger.info(`User Account Storage Info changed: ${JSON.stringify(userAccountStorageInfo, null, 2)}.`);
  }, [logger, userAccountStorageInfo]);

  useEffect((): (() => void) => {
    const GET_USER_ACCOUNT_STORAGE_INFO_RESPONSE: IPCAPIResponse<IUserAccountStorageInfo | null> = window.userAccountAPI.getUserAccountStorageInfo();
    if (GET_USER_ACCOUNT_STORAGE_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({ message: "Error getting User Account Storage Info.", variant: "error" });
      setUserAccountStorageInfo(null);
    } else {
      setUserAccountStorageInfo(GET_USER_ACCOUNT_STORAGE_INFO_RESPONSE.data);
    }
    // Monitor changes to User Account Storage
    const removeOnUserAccountStorageChangedListener: () => void = window.userAccountAPI.onUserAccountStorageChanged(
      (newUserAccountStorageInfo: IUserAccountStorageInfo | null): void => {
        setUserAccountStorageInfo((prevUserAccountStorageInfo: IUserAccountStorageInfo | null): IUserAccountStorageInfo | null => {
          if (newUserAccountStorageInfo !== null && prevUserAccountStorageInfo === null) {
            enqueueSnackbar({ message: `Set ${newUserAccountStorageInfo.name} user account storage.`, variant: "info" });
            return newUserAccountStorageInfo;
          }
          if (newUserAccountStorageInfo === null && prevUserAccountStorageInfo !== null) {
            enqueueSnackbar({ message: `Unset ${prevUserAccountStorageInfo.name} user account storage.`, variant: "warning" });
            return newUserAccountStorageInfo;
          }
          return newUserAccountStorageInfo;
        });
      }
    );
    // Monitor changes to User Account Storage info
    const removeOnUserAccountStorageInfoChangedListener: () => void = window.userAccountAPI.onUserAccountStorageInfoChanged(
      (newUserAccountStorageInfo: IUserAccountStorageInfo): void => {
        setUserAccountStorageInfo((prevUserAccountStorageInfo: IUserAccountStorageInfo | null): IUserAccountStorageInfo | null => {
          if (prevUserAccountStorageInfo === null) {
            logger.warn("User Account Storage info changed callback invoked with no User Account Storage set! No-op.");
            enqueueSnackbar({ message: "New user account storage info received without being set.", variant: "error" });
            return null;
          }
          if (prevUserAccountStorageInfo.backend.isOpen !== newUserAccountStorageInfo.backend.isOpen) {
            if (newUserAccountStorageInfo.backend.isOpen) {
              enqueueSnackbar({ message: `Opened ${newUserAccountStorageInfo.name} user account storage.`, variant: "info" });
            } else {
              enqueueSnackbar({ message: `Closed ${newUserAccountStorageInfo.name} user account storage.`, variant: "warning" });
            }
          }
          return newUserAccountStorageInfo;
        });
      }
    );
    return (): void => {
      logger.debug("Removing User Account Storage event listeners.");
      removeOnUserAccountStorageChangedListener();
      removeOnUserAccountStorageInfoChangedListener();
    };
  }, [logger]);

  return userAccountStorageInfo;
};
