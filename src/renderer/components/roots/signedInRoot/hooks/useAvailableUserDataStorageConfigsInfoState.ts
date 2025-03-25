import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import {
  isValidUserDataStorageConfigInfo,
  isValidUserDataStorageConfigInfoArray,
  IUserDataStorageConfigInfo
} from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IDataChangedDiff, isValidDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

export const useAvailableUserDataStorageConfigsInfoState = (logger: LogFunctions): IUserDataStorageConfigInfo[] => {
  // TODO: Replace with Map
  const [availableUserDataStorageConfigsInfo, setAvailableUserDataStorageConfigsInfo] = useState<IUserDataStorageConfigInfo[]>([]);

  useEffect((): void => {
    logger.info(`Available User Data Storage Configs Info changed. Count: ${availableUserDataStorageConfigsInfo.length.toString()}.`);
  }, [logger, availableUserDataStorageConfigsInfo]);

  useEffect((): (() => void) => {
    // Get all available User Data Storage Configs
    const GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGE_CONFIGS_INFO_RESPONSE: IPCAPIResponse<IEncryptedData<IUserDataStorageConfigInfo[]>> =
      window.userAPI.getAllSignedInUserAvailableDataStorageConfigsInfo();
    if (GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGE_CONFIGS_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      logger.error(
        `Could not get all signed in user's available User Data Storage Configs Info! Reason: ${GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGE_CONFIGS_INFO_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting available data storage configs' information.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStorageConfigInfo[]>(
        GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGE_CONFIGS_INFO_RESPONSE.data,
        isValidUserDataStorageConfigInfoArray,
        "all signed in user's available User Data Storage Configs Info"
      )
        .then(
          (allSignedInUserAvailableDataStorageConfigsInfo: IUserDataStorageConfigInfo[]): void => {
            setAvailableUserDataStorageConfigsInfo(allSignedInUserAvailableDataStorageConfigsInfo);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt all signed in user's available User Data Storage Configs Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data storage configs' information.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt all signed in user's available User Data Storage Configs Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting data storage configs' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Storages Info
    const removeAvailableUserDataStorageConfigsChangedListener: () => void = window.userAPI.onAvailableUserDataStorageConfigsChanged(
      (encryptedAvailableUserDataStorageConfigsInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageConfigInfo>>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IDataChangedDiff<string, IUserDataStorageConfigInfo>>(
          encryptedAvailableUserDataStorageConfigsInfoChangedDiff,
          (data: unknown): data is IDataChangedDiff<string, IUserDataStorageConfigInfo> => {
            return isValidDataChangedDiff(
              data,
              (removedData: unknown): removedData is string => {
                return typeof removedData === "string";
              },
              (addedData: unknown): addedData is IUserDataStorageConfigInfo => {
                return isValidUserDataStorageConfigInfo(addedData);
              }
            );
          },
          "available User Data Storage Configs Info Changed Diff"
        )
          .then(
            (availableUserDataStorageConfigsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageConfigInfo>): void => {
              setAvailableUserDataStorageConfigsInfo(
                (prevAvailableUserDataStorageConfigsInfo: IUserDataStorageConfigInfo[]): IUserDataStorageConfigInfo[] => {
                  return [
                    ...prevAvailableUserDataStorageConfigsInfo.filter((configInfo: IUserDataStorageConfigInfo): boolean => {
                      return !availableUserDataStorageConfigsInfoChangedDiff.removed.includes(configInfo.storageId);
                    }),
                    ...availableUserDataStorageConfigsInfoChangedDiff.added
                  ];
                }
              );
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              logger.error(`Could not decrypt available User Data Storage Configs Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting available data storage configs' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt available User Data Storage Configs Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting available data storage configs' information changes.", variant: "error" });
          });
      }
    );

    return (): void => {
      logger.debug("Removing available User Data Storage Configs event listeners.");
      removeAvailableUserDataStorageConfigsChangedListener();
    };
  }, [logger]);

  return availableUserDataStorageConfigsInfo;
};
