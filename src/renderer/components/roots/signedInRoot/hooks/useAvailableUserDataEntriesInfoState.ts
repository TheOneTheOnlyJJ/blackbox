import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { isValidUserDataEntryIdentifier, IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { isValidUserDataEntryInfo, isValidUserDataEntryInfoArray, IUserDataEntryInfo } from "@shared/user/data/entry/info/UserDataEntryInfo";
import { isUserDataEntryIdentifierMatchingUserDataEntryInfo } from "@shared/user/data/entry/utils/isUserDataEntryIdentifierMatchingUserDataEntryInfo";
import { IDataChangedDiff, isValidDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useState } from "react";

export const useAvailableUserDataEntriesInfoState = (
  logger: LogFunctions
): {
  availableUserDataDataEntriesInfo: IUserDataEntryInfo[];
  getAvailableUserDataEntryInfoByIdentifier: (userDataEntryIdentifier: IUserDataEntryIdentifier) => IUserDataEntryInfo | null;
} => {
  // TODO: Replace with Map
  const [availableUserDataDataEntriesInfo, setAvailableUserDataDataEntriesInfo] = useState<IUserDataEntryInfo[]>([]);

  const getAvailableUserDataEntryInfoByIdentifier = useCallback(
    (userDataEntryIdentifier: IUserDataEntryIdentifier): IUserDataEntryInfo | null => {
      const DATA_ENTRY_INFO: IUserDataEntryInfo | undefined = availableUserDataDataEntriesInfo.find((dataEntryInfo: IUserDataEntryInfo) => {
        return isUserDataEntryIdentifierMatchingUserDataEntryInfo(userDataEntryIdentifier, dataEntryInfo);
      });
      if (DATA_ENTRY_INFO === undefined) {
        logger.warn(
          `Could not get info for User Data Entry "${userDataEntryIdentifier.entryId}" from User Data Template "${userDataEntryIdentifier.templateId}" from User Data Box "${userDataEntryIdentifier.boxId}" from User Data Storage "${userDataEntryIdentifier.storageId}".`
        );
        return null;
      }
      return DATA_ENTRY_INFO;
    },
    [logger, availableUserDataDataEntriesInfo]
  );

  useEffect((): void => {
    logger.info(`Available User Data Entries Info changed. Count: ${availableUserDataDataEntriesInfo.length.toString()}.`);
  }, [logger, availableUserDataDataEntriesInfo]);

  useEffect((): (() => void) => {
    // Get all available User Data Entries Info
    const GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_ENTRIES_INFO_RESPONSE: IPCAPIResponse<IEncryptedData<IUserDataEntryInfo[]>> =
      window.userDataEntryAPI.getAllSignedInUserAvailableUserDataEntriesInfo();
    if (GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_ENTRIES_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      logger.error(
        `Could not get all signed in user's available User Data Entries Info! Reason: ${GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_ENTRIES_INFO_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting available data entries' information.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IUserDataEntryInfo[]>(
        GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_ENTRIES_INFO_RESPONSE.data,
        isValidUserDataEntryInfoArray,
        "all signed in user's available User Data Entries Info"
      )
        .then(
          (allSignedInUserAvailableDataEntriesInfo: IUserDataEntryInfo[]): void => {
            setAvailableUserDataDataEntriesInfo(allSignedInUserAvailableDataEntriesInfo);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt all signed in user's available User Data Entries Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data entries' information.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt all signed in user's available User Data Entries Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting data entries' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Entries Info
    const removeUserDataEntriesChangedListener: () => void = window.userDataEntryAPI.onAvailableUserDataEntriesChanged(
      (encryptedUserDataEntriesInfoChangedDiff: IEncryptedData<IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo>>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo>>(
          encryptedUserDataEntriesInfoChangedDiff,
          (data: unknown): data is IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo> => {
            return isValidDataChangedDiff(data, isValidUserDataEntryIdentifier, isValidUserDataEntryInfo);
          },
          "User Data Entries Info Changed Diff"
        )
          .then(
            (userDataEntriesInfoChangedDiff: IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo>): void => {
              setAvailableUserDataDataEntriesInfo((prevAvailableUserDataEntriesInfo: IUserDataEntryInfo[]): IUserDataEntryInfo[] => {
                return [
                  ...prevAvailableUserDataEntriesInfo.filter((availableDataEntryInfo: IUserDataEntryInfo): boolean => {
                    const MATCHED_IDENTIFIER_TO_REMOVE: boolean = userDataEntriesInfoChangedDiff.removed.some(
                      (userDataEntryIdentifierToRemove: IUserDataEntryIdentifier): boolean => {
                        return isUserDataEntryIdentifierMatchingUserDataEntryInfo(userDataEntryIdentifierToRemove, availableDataEntryInfo);
                      }
                    );
                    return !MATCHED_IDENTIFIER_TO_REMOVE;
                  }),
                  ...userDataEntriesInfoChangedDiff.added
                ];
              });
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              logger.error(`Could not decrypt User Data Entries Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting data entries' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Entries Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data entries' information changes.", variant: "error" });
          });
      }
    );
    return (): void => {
      logger.debug("Removing available User Data Entries event listeners.");
      removeUserDataEntriesChangedListener();
    };
  }, [logger]);

  return {
    availableUserDataDataEntriesInfo: availableUserDataDataEntriesInfo,
    getAvailableUserDataEntryInfoByIdentifier: getAvailableUserDataEntryInfoByIdentifier
  };
};
