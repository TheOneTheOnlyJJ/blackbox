import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import {
  isValidUserDataStorageInfo,
  isValidUserDataStorageInfoArray,
  IUserDataStorageInfo
} from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IDataChangedDiff, isValidDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useState } from "react";

export const useInitialisedUserDataStoragesInfoState = (
  logger: LogFunctions
): {
  initialisedUserDataStoragesInfo: IUserDataStorageInfo[];
  getInitialisedUserDataStorageInfoById: (storageId: string) => IUserDataStorageInfo | null;
} => {
  // TODO: Replace with Map
  const [initialisedUserDataStoragesInfo, setInitialisedUserDataStoragesInfo] = useState<IUserDataStorageInfo[]>([]);

  const getInitialisedUserDataStorageInfoById = useCallback(
    (storageId: string): IUserDataStorageInfo | null => {
      const DATA_STORAGE_INFO: IUserDataStorageInfo | undefined = initialisedUserDataStoragesInfo.find((dataStorageInfo: IUserDataStorageInfo) => {
        return dataStorageInfo.storageId === storageId;
      });
      if (DATA_STORAGE_INFO === undefined) {
        logger.warn(`Could not get info for User Data Storage ${storageId}.`);
        return null;
      }
      return DATA_STORAGE_INFO;
    },
    [logger, initialisedUserDataStoragesInfo]
  );

  useEffect((): void => {
    logger.info(`Initialised User Data Storages Info changed. Count: ${initialisedUserDataStoragesInfo.length.toString()}.`);
  }, [logger, initialisedUserDataStoragesInfo]);

  useEffect((): (() => void) => {
    const GET_ALL_SIGNED_IN_USER_INITIALISED_DATA_STORAGES_INFO_RESPONSE: IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>> =
      window.userDataStorageAPI.getAllSignedInUserInitialisedDataStoragesInfo();
    if (GET_ALL_SIGNED_IN_USER_INITIALISED_DATA_STORAGES_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      logger.error(
        `Could not get all signed in user's initialised User Data Storages Info! Reason: ${GET_ALL_SIGNED_IN_USER_INITIALISED_DATA_STORAGES_INFO_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting active data storage' information.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStorageInfo[]>(
        GET_ALL_SIGNED_IN_USER_INITIALISED_DATA_STORAGES_INFO_RESPONSE.data,
        isValidUserDataStorageInfoArray,
        "all signed in user's initialised User Data Storages Info"
      )
        .then(
          (allSignedInUserInitialisedDataStoragesInfo: IUserDataStorageInfo[]): void => {
            setInitialisedUserDataStoragesInfo(allSignedInUserInitialisedDataStoragesInfo);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt all signed in user's initialised User Data Storages Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data storages' information.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt all signed in user's initialised User Data Storages Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting data storages' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Storages
    const removeInitialisedUserDataStoragesChangedListener: () => void = window.userDataStorageAPI.onInitialisedUserDataStoragesChanged(
      (encryptedInitialisedUserDataStoragesInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageInfo>>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IDataChangedDiff<string, IUserDataStorageInfo>>(
          encryptedInitialisedUserDataStoragesInfoChangedDiff,
          (data: unknown): data is IDataChangedDiff<string, IUserDataStorageInfo> => {
            return isValidDataChangedDiff(
              data,
              (removedData: unknown): removedData is string => {
                return typeof removedData === "string";
              },
              (addedData: unknown): addedData is IUserDataStorageInfo => {
                return isValidUserDataStorageInfo(addedData);
              }
            );
          },
          "initialised User Data Storages Info Changed Diff"
        )
          .then(
            (initialisedUserDataStoragesInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageInfo>): void => {
              setInitialisedUserDataStoragesInfo((prevInitialisedUserDataStoragesInfo: IUserDataStorageInfo[]): IUserDataStorageInfo[] => {
                return [
                  ...prevInitialisedUserDataStoragesInfo.filter((storageInfo: IUserDataStorageInfo): boolean => {
                    return !initialisedUserDataStoragesInfoChangedDiff.removed.includes(storageInfo.storageId);
                  }),
                  ...initialisedUserDataStoragesInfoChangedDiff.added
                ];
              });
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              logger.error(`Could not decrypt initialised User Data Storages Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting active data storages' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt initialised User Data Storages Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting active data storages' information changes.", variant: "error" });
          });
      }
    );
    // Monitor changes to User Data Storages Info
    const removeInitialisedUserDataStorageInfoChangedListener: () => void = window.userDataStorageAPI.onInitialisedUserDataStorageInfoChanged(
      (encryptedNewUserDataStorageInfo: IEncryptedData<IUserDataStorageInfo>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStorageInfo>(
          encryptedNewUserDataStorageInfo,
          isValidUserDataStorageInfo,
          "new initialised User Data Storage Info"
        )
          .then(
            (newUserDataStorageInfo: IUserDataStorageInfo): void => {
              setInitialisedUserDataStoragesInfo((prevInitialisedUserDataStoragesInfo: IUserDataStorageInfo[]): IUserDataStorageInfo[] => {
                return prevInitialisedUserDataStoragesInfo.map((prevUserDataStorageInfo: IUserDataStorageInfo): IUserDataStorageInfo => {
                  return newUserDataStorageInfo.storageId === prevUserDataStorageInfo.storageId ? newUserDataStorageInfo : prevUserDataStorageInfo;
                });
              });
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              logger.error(`Could not decrypt new initialised User Data Storage Info. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting active data storage's new information.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt new initialised User Data Storage Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting active data storage's new information.", variant: "error" });
          });
      }
    );

    return (): void => {
      logger.debug("Removing initialised User Data Storages event listeners.");
      removeInitialisedUserDataStoragesChangedListener();
      removeInitialisedUserDataStorageInfoChangedListener();
    };
  }, [logger]);

  return {
    initialisedUserDataStoragesInfo: initialisedUserDataStoragesInfo,
    getInitialisedUserDataStorageInfoById: getInitialisedUserDataStorageInfoById
  };
};
