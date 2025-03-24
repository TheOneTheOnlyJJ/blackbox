import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import {
  isValidUserDataStorageVisibilityGroupInfo,
  isValidUserDataStorageVisibilityGroupInfoArray,
  IUserDataStorageVisibilityGroupInfo
} from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { IDataChangedDiff, isValidDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { useState, useEffect } from "react";

export const useOpenUserDataStorageVisibilityGroupsInfoState = (logger: LogFunctions): IUserDataStorageVisibilityGroupInfo[] => {
  const [openUserDataStorageVisibilityGroupsInfo, setOpenUserDataStorageVisibilityGroupsInfo] = useState<IUserDataStorageVisibilityGroupInfo[]>([]);

  useEffect((): void => {
    logger.info(`Open User Data Storage Visibility Groups Info changed. Count: ${openUserDataStorageVisibilityGroupsInfo.length.toString()}.`);
  }, [logger, openUserDataStorageVisibilityGroupsInfo]);

  useEffect((): (() => void) => {
    // Get all Open User Data Storage Visibility Groups
    const GET_ALL_SIGNED_IN_USER_OPEN_DATA_STORAGE_VISIBILITY_GROUPS_INFO_RESPONSE: IPCAPIResponse<
      IEncryptedData<IUserDataStorageVisibilityGroupInfo[]>
    > = window.userAPI.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo();
    if (GET_ALL_SIGNED_IN_USER_OPEN_DATA_STORAGE_VISIBILITY_GROUPS_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      logger.error(
        `Could not get all signed in user's open User Data Storage Visibility Groups Info! Reason: ${GET_ALL_SIGNED_IN_USER_OPEN_DATA_STORAGE_VISIBILITY_GROUPS_INFO_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting open data storage visibility groups' information.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStorageVisibilityGroupInfo[]>(
        GET_ALL_SIGNED_IN_USER_OPEN_DATA_STORAGE_VISIBILITY_GROUPS_INFO_RESPONSE.data,
        isValidUserDataStorageVisibilityGroupInfoArray,
        "all signed in user's open User Data Storage Visibility Groups Info"
      )
        .then(
          (allSignedInUserOpenDataStorageVisibilityGroupsInfo: IUserDataStorageVisibilityGroupInfo[]): void => {
            setOpenUserDataStorageVisibilityGroupsInfo(allSignedInUserOpenDataStorageVisibilityGroupsInfo);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt all signed in user's open User Data Storage Visibility Groups Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting open data storage visibility groups' information.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt all signed in user's open User Data Storage Visibility Groups Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting open data storage visibility groups' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Storage Visibility Groups Info
    const removeOpenUserDataStorageVisibilityGroupsChangedListener: () => void = window.userAPI.onOpenUserDataStorageVisibilityGroupsChanged(
      (
        encryptedOpenUserDataStorageVisibilityGroupsInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>>
      ): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>>(
          encryptedOpenUserDataStorageVisibilityGroupsInfoChangedDiff,
          (data: unknown): data is IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo> => {
            return isValidDataChangedDiff(
              data,
              (removedData: unknown): removedData is string => {
                return typeof removedData === "string";
              },
              (addedData: unknown): addedData is IUserDataStorageVisibilityGroupInfo => {
                return isValidUserDataStorageVisibilityGroupInfo(addedData);
              }
            );
          },
          "User Data Storage Visibility Groups Info Changed Diff"
        )
          .then(
            (openUserDataStorageVisibilityGroupsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>): void => {
              setOpenUserDataStorageVisibilityGroupsInfo(
                (prevOpenUserDataStorageVisibilityGroupsInfo: IUserDataStorageVisibilityGroupInfo[]): IUserDataStorageVisibilityGroupInfo[] => {
                  return [
                    ...prevOpenUserDataStorageVisibilityGroupsInfo.filter((visibilityGroupInfo: IUserDataStorageVisibilityGroupInfo): boolean => {
                      return !openUserDataStorageVisibilityGroupsInfoChangedDiff.removed.includes(visibilityGroupInfo.visibilityGroupId);
                    }),
                    ...openUserDataStorageVisibilityGroupsInfoChangedDiff.added
                  ];
                }
              );
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              logger.error(`Could not decrypt open User Data Storage Visibility Groups Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting open data storage visibility groups' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Storage Visibility Groups Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting open data storage visibility groups' information changes.", variant: "error" });
          });
      }
    );
    return (): void => {
      logger.debug("Removing open User Data Storage Visibility Groups event listeners.");
      removeOpenUserDataStorageVisibilityGroupsChangedListener();
    };
  }, [logger]);

  return openUserDataStorageVisibilityGroupsInfo;
};
