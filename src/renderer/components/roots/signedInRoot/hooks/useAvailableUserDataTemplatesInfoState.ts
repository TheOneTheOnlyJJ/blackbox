import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { isValidUserDataTemplateIdentifier, IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import {
  isValidUserDataTemplateInfo,
  isValidUserDataTemplateInfoArray,
  IUserDataTemplateInfo
} from "@shared/user/data/template/info/UserDataTemplateInfo";
import { isUserDataTemplateIdentifierMatchingUserDataTemplateInfo } from "@shared/user/data/template/utils/isUserDataTemplateIdentifierMatchingUserDataTemplateInfo";
import { IDataChangedDiff, isValidDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useState } from "react";

export const useAvailableUserDataTemplatesInfoState = (
  logger: LogFunctions
): {
  availableUserDataDataTemplatesInfo: IUserDataTemplateInfo[];
  getAvailableUserDataTemplateInfoByIdentifier: (userDataTemplateIdentifier: IUserDataTemplateIdentifier) => IUserDataTemplateInfo | null;
} => {
  // TODO: Replace with Map
  const [availableUserDataDataTemplatesInfo, setAvailableUserDataDataTemplatesInfo] = useState<IUserDataTemplateInfo[]>([]);

  const getAvailableUserDataTemplateInfoByIdentifier = useCallback(
    (userDataTemplateIdentifier: IUserDataTemplateIdentifier): IUserDataTemplateInfo | null => {
      const DATA_TEMPLATE_INFO: IUserDataTemplateInfo | undefined = availableUserDataDataTemplatesInfo.find(
        (dataTemplateInfo: IUserDataTemplateInfo) => {
          return isUserDataTemplateIdentifierMatchingUserDataTemplateInfo(userDataTemplateIdentifier, dataTemplateInfo);
        }
      );
      if (DATA_TEMPLATE_INFO === undefined) {
        logger.warn(
          `Could not get info for User Data Template ${userDataTemplateIdentifier.templateId} from User Data Box ${userDataTemplateIdentifier.boxId} from User Data Storage ${userDataTemplateIdentifier.storageId}.`
        );
        return null;
      }
      return DATA_TEMPLATE_INFO;
    },
    [logger, availableUserDataDataTemplatesInfo]
  );

  useEffect((): void => {
    logger.info(`Available User Data Templates Info changed. Count: ${availableUserDataDataTemplatesInfo.length.toString()}.`);
  }, [logger, availableUserDataDataTemplatesInfo]);

  useEffect((): (() => void) => {
    // Get all available User Data Templates Info
    const GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_TEMPLATES_INFO_RESPONSE: IPCAPIResponse<IEncryptedData<IUserDataTemplateInfo[]>> =
      window.userDataTemplateAPI.getAllSignedInUserAvailableUserDataTemplatesInfo();
    if (GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_TEMPLATES_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      logger.error(
        `Could not get all signed in user's available User Data Templates Info! Reason: ${GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_TEMPLATES_INFO_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting available data templates' information.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IUserDataTemplateInfo[]>(
        GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_TEMPLATES_INFO_RESPONSE.data,
        isValidUserDataTemplateInfoArray,
        "all signed in user's available User Data Templates Info"
      )
        .then(
          (allSignedInUserAvailableDataTemplatesInfo: IUserDataTemplateInfo[]): void => {
            setAvailableUserDataDataTemplatesInfo(allSignedInUserAvailableDataTemplatesInfo);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt all signed in user's available User Data Templates Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data templates' information.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          logger.error(`Could not decrypt all signed in user's available User Data Templates Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting data templates' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Templates Info
    const removeUserDataTemplatesChangedListener: () => void = window.userDataTemplateAPI.onAvailableUserDataTemplatesChanged(
      (encryptedUserDataTemplatesInfoChangedDiff: IEncryptedData<IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplateInfo>>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplateInfo>>(
          encryptedUserDataTemplatesInfoChangedDiff,
          (data: unknown): data is IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplateInfo> => {
            return isValidDataChangedDiff(data, isValidUserDataTemplateIdentifier, isValidUserDataTemplateInfo);
          },
          "User Data Templates Info Changed Diff"
        )
          .then(
            (userDataTemplatesInfoChangedDiff: IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplateInfo>): void => {
              setAvailableUserDataDataTemplatesInfo((prevAvailableUserDataTemplatesInfo: IUserDataTemplateInfo[]): IUserDataTemplateInfo[] => {
                return [
                  ...prevAvailableUserDataTemplatesInfo.filter((availableDataTemplateInfo: IUserDataTemplateInfo): boolean => {
                    const MATCHED_IDENTIFIER_TO_REMOVE: boolean = userDataTemplatesInfoChangedDiff.removed.some(
                      (userDataTemplateIdentifierToRemove: IUserDataTemplateIdentifier): boolean => {
                        return isUserDataTemplateIdentifierMatchingUserDataTemplateInfo(
                          userDataTemplateIdentifierToRemove,
                          availableDataTemplateInfo
                        );
                      }
                    );
                    return !MATCHED_IDENTIFIER_TO_REMOVE;
                  }),
                  ...userDataTemplatesInfoChangedDiff.added
                ];
              });
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              logger.error(`Could not decrypt User Data Templates Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting data templates' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            logger.error(`Could not decrypt User Data Templates Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data templates' information changes.", variant: "error" });
          });
      }
    );
    return (): void => {
      logger.debug("Removing available User Data Templates event listeners.");
      removeUserDataTemplatesChangedListener();
    };
  }, [logger]);

  return {
    availableUserDataDataTemplatesInfo: availableUserDataDataTemplatesInfo,
    getAvailableUserDataTemplateInfoByIdentifier: getAvailableUserDataTemplateInfoByIdentifier
  };
};
