import { FC, useCallback, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { IAppRootContext, useAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { ISignedInRootContext } from "./SignedInRootContext";
import { appLogger } from "@renderer/utils/loggers";
import { IUserDataStorageInfo, LIST_OF_USER_DATA_STORAGES_INFO_VALIDATE_FUNCTION } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import {
  IUserDataStoragesInfoChangedDiff,
  USER_DATA_STORAGES_INFO_CHANGED_DIFF_VALIDATE_FUNCTION
} from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";

const DEFAULT_FORBIDDEN_LOCATION_NAME = "this";

const SignedInRoot: FC = () => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const [forbiddenLocationName, setForbiddenLocationName] = useState<string>(DEFAULT_FORBIDDEN_LOCATION_NAME);
  const URIencodeAndSetForbiddenLocationName = useCallback((newForbiddenLocationname: string): void => {
    try {
      newForbiddenLocationname = encodeURIComponent(newForbiddenLocationname);
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      appLogger.error(`Could not set forbidden location name: ${ERROR_MESSAGE}!`);
      newForbiddenLocationname = DEFAULT_FORBIDDEN_LOCATION_NAME;
    } finally {
      setForbiddenLocationName(newForbiddenLocationname);
    }
  }, []);
  const [userDataStoragesInfo, setUserDataStoragesInfo] = useState<IUserDataStorageInfo[]>([]);

  useEffect((): void => {
    appLogger.info(`User Data Storages Info changed. Count: ${userDataStoragesInfo.length.toString()}.`);
  }, [userDataStoragesInfo]);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering Signed In Root component.");
    // Get all Public User Data Storage Configs
    const GET_ALL_SIGNED_IN_USER_DATA_STORAGES_INFO_RESPONSE: IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>> =
      window.userAPI.getAllSignedInUserDataStoragesInfo();
    if (GET_ALL_SIGNED_IN_USER_DATA_STORAGES_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      appLogger.error(
        `Could not get all signed in user's User Data Storages Info! Reason: ${GET_ALL_SIGNED_IN_USER_DATA_STORAGES_INFO_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting data storages' information.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStorageInfo[]>(
        GET_ALL_SIGNED_IN_USER_DATA_STORAGES_INFO_RESPONSE.data,
        LIST_OF_USER_DATA_STORAGES_INFO_VALIDATE_FUNCTION,
        "all signed in user's User Data Storages Info"
      )
        .then(
          (allSignedInUserDataStoragesInfo: IUserDataStorageInfo[]): void => {
            setUserDataStoragesInfo(allSignedInUserDataStoragesInfo);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not decrypt all signed in user's User Data Storages Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data storages' information.", variant: "error" });
          }
        )
        .catch((err: unknown): void => {
          const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
          appLogger.error(`Could not decrypt all signed in user's User Data Storages Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting data storages' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Storages Info
    const removeUserDataStoragesChangedListener: () => void = window.userAPI.onUserDataStoragesChanged(
      (encryptedUserDataStoragesInfoChangedDiff: IEncryptedData<IUserDataStoragesInfoChangedDiff>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON(
          encryptedUserDataStoragesInfoChangedDiff,
          USER_DATA_STORAGES_INFO_CHANGED_DIFF_VALIDATE_FUNCTION,
          "User Data Storages Info Changed Diff"
        )
          .then(
            (userDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff): void => {
              setUserDataStoragesInfo((prevUserDataStoragesInfo: IUserDataStorageInfo[]): IUserDataStorageInfo[] => {
                return [
                  ...prevUserDataStoragesInfo.filter((config: IUserDataStorageInfo): boolean => {
                    return !userDataStoragesInfoChangedDiff.deleted.includes(config.storageId);
                  }),
                  ...userDataStoragesInfoChangedDiff.added
                ];
              });
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              appLogger.error(`Could not decrypt User Data Storages Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting data storages' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not decrypt User Data Storages Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data storages' information changes.", variant: "error" });
          });
      }
    );
    return (): void => {
      appLogger.debug("Removing Signed In Root event listeners.");
      removeUserDataStoragesChangedListener();
    };
  }, []);

  return appRootContext.signedInUser !== null ? (
    <Outlet
      context={
        {
          ...appRootContext,
          signedInUser: appRootContext.signedInUser,
          userDataStoragesInfo: userDataStoragesInfo,
          setForbiddenLocationName: URIencodeAndSetForbiddenLocationName
        } satisfies ISignedInRootContext
      }
    />
  ) : (
    <Navigate to={`/forbidden/you-must-be-signed-in-to-access-the-${forbiddenLocationName}-page`} />
  );
};

export default SignedInRoot;
