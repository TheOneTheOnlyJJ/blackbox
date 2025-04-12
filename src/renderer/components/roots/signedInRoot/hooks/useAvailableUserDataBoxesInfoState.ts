import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { isValidUserDataBoxInfo, isValidUserDataBoxInfoArray, IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IDataChangedDiff, isValidDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

export const useAvailableUserDataBoxesInfoState = (logger: LogFunctions): IUserDataBoxInfo[] => {
  // TODO: Replace with Map
  const [availableUserDataDataBoxesInfo, setAvailableUserDataDataBoxesInfo] = useState<IUserDataBoxInfo[]>([]);

  useEffect((): void => {
    logger.info(`Available User Data Boxes Info changed. Count: ${availableUserDataDataBoxesInfo.length.toString()}.`);
  }, [logger, availableUserDataDataBoxesInfo]);

  useEffect((): (() => void) => {
    // Get all available User Data Boxes Info
    const GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_BOXES_INFO_RESPONSE: IPCAPIResponse<IEncryptedData<IUserDataBoxInfo[]>> =
      window.userDataBoxAPI.getAllSignedInUserAvailableUserDataBoxesInfo();
    if (GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_BOXES_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      logger.error(
        `Could not get all signed in user's available User Data Boxes Info! Reason: ${GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_BOXES_INFO_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting available data boxes' information.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IUserDataBoxInfo[]>(
        GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_BOXES_INFO_RESPONSE.data,
        isValidUserDataBoxInfoArray,
        "all signed in user's available User Data Boxes Info"
      )
        .then(
          (allSignedInUserAvailableDataBoxesInfo: IUserDataBoxInfo[]): void => {
            setAvailableUserDataDataBoxesInfo(allSignedInUserAvailableDataBoxesInfo);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt all signed in user's available User Data Boxes Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data boxes' information.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt all signed in user's available User Data Boxes Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting data boxes' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Boxes Info
    const removeUserDataBoxesChangedListener: () => void = window.userDataBoxAPI.onAvailableUserDataBoxesChanged(
      (encryptedUserDataBoxesInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataBoxInfo>>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IDataChangedDiff<string, IUserDataBoxInfo>>(
          encryptedUserDataBoxesInfoChangedDiff,
          (data: unknown): data is IDataChangedDiff<string, IUserDataBoxInfo> => {
            return isValidDataChangedDiff(
              data,
              (removedData: unknown): removedData is string => {
                return typeof removedData === "string";
              },
              (addedData: unknown): addedData is IUserDataBoxInfo => {
                return isValidUserDataBoxInfo(addedData);
              }
            );
          },
          "User Data Boxes Info Changed Diff"
        )
          .then(
            (userDataBoxesInfoChangedDiff: IDataChangedDiff<string, IUserDataBoxInfo>): void => {
              setAvailableUserDataDataBoxesInfo((prevAvailableUserDataBoxesInfo: IUserDataBoxInfo[]): IUserDataBoxInfo[] => {
                return [
                  ...prevAvailableUserDataBoxesInfo.filter((dataBoxInfo: IUserDataBoxInfo): boolean => {
                    return !userDataBoxesInfoChangedDiff.removed.includes(dataBoxInfo.boxId);
                  }),
                  ...userDataBoxesInfoChangedDiff.added
                ];
              });
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              logger.error(`Could not decrypt User Data Boxes Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting data boxes' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Boxes Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data boxes' information changes.", variant: "error" });
          });
      }
    );
    return (): void => {
      logger.debug("Removing available User Data Boxes event listeners.");
      removeUserDataBoxesChangedListener();
    };
  }, [logger]);

  return availableUserDataDataBoxesInfo;
};
