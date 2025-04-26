import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { isValidUserDataBoxIdentifier, IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";
import { isValidUserDataBoxInfo, isValidUserDataBoxInfoArray, IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { isUserDataBoxIdentifierMatchingUserDataBoxInfo } from "@shared/user/data/box/utils/isUserDataBoxIdentifierMatchingUserDataBoxInfo";
import { IDataChangedDiff, isValidDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useState } from "react";

export const useAvailableUserDataBoxesInfoState = (
  logger: LogFunctions
): {
  availableUserDataDataBoxesInfo: IUserDataBoxInfo[];
  getAvailableUserDataBoxInfoByIdentifier: (userDataBoxIdentifier: IUserDataBoxIdentifier) => IUserDataBoxInfo | null;
} => {
  // TODO: Replace with Map
  const [availableUserDataDataBoxesInfo, setAvailableUserDataDataBoxesInfo] = useState<IUserDataBoxInfo[]>([]);

  const getAvailableUserDataBoxInfoByIdentifier = useCallback(
    (userDataBoxIdentifier: IUserDataBoxIdentifier): IUserDataBoxInfo | null => {
      const DATA_BOX_INFO: IUserDataBoxInfo | undefined = availableUserDataDataBoxesInfo.find((dataBoxInfo: IUserDataBoxInfo) => {
        return isUserDataBoxIdentifierMatchingUserDataBoxInfo(userDataBoxIdentifier, dataBoxInfo);
      });
      if (DATA_BOX_INFO === undefined) {
        logger.warn(`Could not get info for User Data Box ${userDataBoxIdentifier.boxId} from User Data Storage ${userDataBoxIdentifier.storageId}.`);
        return null;
      }
      return DATA_BOX_INFO;
    },
    [logger, availableUserDataDataBoxesInfo]
  );

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
      (encryptedUserDataBoxesInfoChangedDiff: IEncryptedData<IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBoxInfo>>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBoxInfo>>(
          encryptedUserDataBoxesInfoChangedDiff,
          (data: unknown): data is IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBoxInfo> => {
            return isValidDataChangedDiff(data, isValidUserDataBoxIdentifier, isValidUserDataBoxInfo);
          },
          "User Data Boxes Info Changed Diff"
        )
          .then(
            (userDataBoxesInfoChangedDiff: IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBoxInfo>): void => {
              setAvailableUserDataDataBoxesInfo((prevAvailableUserDataBoxesInfo: IUserDataBoxInfo[]): IUserDataBoxInfo[] => {
                return [
                  ...prevAvailableUserDataBoxesInfo.filter((availableDataBoxInfo: IUserDataBoxInfo): boolean => {
                    const MATCHED_IDENTIFIER_TO_REMOVE: boolean = userDataBoxesInfoChangedDiff.removed.some(
                      (userDataBoxIdentifierToRemove: IUserDataBoxIdentifier): boolean => {
                        return isUserDataBoxIdentifierMatchingUserDataBoxInfo(userDataBoxIdentifierToRemove, availableDataBoxInfo);
                      }
                    );
                    return !MATCHED_IDENTIFIER_TO_REMOVE;
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

  return {
    availableUserDataDataBoxesInfo: availableUserDataDataBoxesInfo,
    getAvailableUserDataBoxInfoByIdentifier: getAvailableUserDataBoxInfoByIdentifier
  };
};
