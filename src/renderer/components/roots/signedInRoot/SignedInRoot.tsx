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
import {
  IUserDataStorageVisibilityGroupInfo,
  LIST_OF_USER_DATA_STORAGES_VISIBILITY_GROUP_INFO_VALIDATE_FUNCTION
} from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import {
  IUserDataStorageVisibilityGroupsInfoChangedDiff,
  USER_DATA_STORAGES_VISIBILITY_GROUPS_INFO_CHANGED_DIFF_VALIDATE_FUNCTION
} from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";

const DEFAULT_FORBIDDEN_LOCATION_NAME = "this";

const SignedInRoot: FC = () => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const [forbiddenLocationName, setForbiddenLocationName] = useState<string>(DEFAULT_FORBIDDEN_LOCATION_NAME);
  const URIencodeAndSetForbiddenLocationName = useCallback((newForbiddenLocationname: string): void => {
    try {
      newForbiddenLocationname = encodeURIComponent(newForbiddenLocationname);
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      appLogger.error(`Could not set forbidden location name: ${ERROR_MESSAGE}!`);
      newForbiddenLocationname = DEFAULT_FORBIDDEN_LOCATION_NAME;
    } finally {
      setForbiddenLocationName(newForbiddenLocationname);
    }
  }, []);
  const [availableUserDataStoragesInfo, setAvailableUserDataStoragesInfo] = useState<IUserDataStorageInfo[]>([]);
  const [openUserDataStorageVisibilityGroupsInfo, setOpenUserDataStorageVisibilityGroupsInfo] = useState<IUserDataStorageVisibilityGroupInfo[]>([]);

  useEffect((): void => {
    appLogger.info(`Available User Data Storages Info changed. Count: ${availableUserDataStoragesInfo.length.toString()}.`);
  }, [availableUserDataStoragesInfo]);

  useEffect((): void => {
    appLogger.info(`Open User Data Storage Visibility Groups Info changed. Count: ${openUserDataStorageVisibilityGroupsInfo.length.toString()}.`);
  }, [openUserDataStorageVisibilityGroupsInfo]);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering Signed In Root component.");
    // Get all available User Data Storage Configs
    const GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGES_INFO_RESPONSE: IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>> =
      window.userAPI.getAllSignedInUserAvailableDataStoragesInfo();
    if (GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGES_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      appLogger.error(
        `Could not get all signed in user's available User Data Storages Info! Reason: ${GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGES_INFO_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting available data storages' information.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStorageInfo[]>(
        GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGES_INFO_RESPONSE.data,
        LIST_OF_USER_DATA_STORAGES_INFO_VALIDATE_FUNCTION,
        "all signed in user's available User Data Storages Info"
      )
        .then(
          (allSignedInUserAvailableDataStoragesInfo: IUserDataStorageInfo[]): void => {
            setAvailableUserDataStoragesInfo(allSignedInUserAvailableDataStoragesInfo);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not decrypt all signed in user's available User Data Storages Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data storages' information.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not decrypt all signed in user's available User Data Storages Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting data storages' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Storages Info
    const removeAvailableUserDataStoragesChangedListener: () => void = window.userAPI.onAvailableUserDataStoragesChanged(
      (encryptedAvailableUserDataStoragesInfoChangedDiff: IEncryptedData<IUserDataStoragesInfoChangedDiff>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStoragesInfoChangedDiff>(
          encryptedAvailableUserDataStoragesInfoChangedDiff,
          USER_DATA_STORAGES_INFO_CHANGED_DIFF_VALIDATE_FUNCTION,
          "available User Data Storages Info Changed Diff"
        )
          .then(
            (availableUserDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff): void => {
              setAvailableUserDataStoragesInfo((prevAvailableUserDataStoragesInfo: IUserDataStorageInfo[]): IUserDataStorageInfo[] => {
                return [
                  ...prevAvailableUserDataStoragesInfo.filter((configInfo: IUserDataStorageInfo): boolean => {
                    return !availableUserDataStoragesInfoChangedDiff.removed.includes(configInfo.storageId);
                  }),
                  ...availableUserDataStoragesInfoChangedDiff.added
                ];
              });
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              appLogger.error(`Could not decrypt available User Data Storages Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting available data storages' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not decrypt available User Data Storages Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting available data storages' information changes.", variant: "error" });
          });
      }
    );
    // Get all Open User Data Storage Visibility Groups
    const GET_ALL_SIGNED_IN_USER_OPEN_DATA_STORAGE_VISIBILITY_GROUPS_INFO_RESPONSE: IPCAPIResponse<
      IEncryptedData<IUserDataStorageVisibilityGroupInfo[]>
    > = window.userAPI.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo();
    if (GET_ALL_SIGNED_IN_USER_OPEN_DATA_STORAGE_VISIBILITY_GROUPS_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      appLogger.error(
        `Could not get all signed in user's open User Data Storage Visibility Groups Info! Reason: ${GET_ALL_SIGNED_IN_USER_OPEN_DATA_STORAGE_VISIBILITY_GROUPS_INFO_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting open data storage visibility groups' information.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStorageVisibilityGroupInfo[]>(
        GET_ALL_SIGNED_IN_USER_OPEN_DATA_STORAGE_VISIBILITY_GROUPS_INFO_RESPONSE.data,
        LIST_OF_USER_DATA_STORAGES_VISIBILITY_GROUP_INFO_VALIDATE_FUNCTION,
        "all signed in user's open User Data Storage Visibility Groups Info"
      )
        .then(
          (allSignedInUserOpenDataStorageVisibilityGroupsInfo: IUserDataStorageVisibilityGroupInfo[]): void => {
            setOpenUserDataStorageVisibilityGroupsInfo(allSignedInUserOpenDataStorageVisibilityGroupsInfo);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not decrypt all signed in user's open User Data Storage Visibility Groups Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting open data storage visibility groups' information.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not decrypt all signed in user's open User Data Storage Visibility Groups Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting open data storage visibility groups' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Storage Visibility Groups Info
    const removeOpenUserDataStorageVisibilityGroupsChangedListener: () => void = window.userAPI.onOpenUserDataStorageVisibilityGroupsChanged(
      (encryptedOpenUserDataStorageVisibilityGroupsInfoChangedDiff: IEncryptedData<IUserDataStorageVisibilityGroupsInfoChangedDiff>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStorageVisibilityGroupsInfoChangedDiff>(
          encryptedOpenUserDataStorageVisibilityGroupsInfoChangedDiff,
          USER_DATA_STORAGES_VISIBILITY_GROUPS_INFO_CHANGED_DIFF_VALIDATE_FUNCTION,
          "User Data Storage Visibility Groups Info Changed Diff"
        )
          .then(
            (openUserDataStorageVisibilityGroupsInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff): void => {
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
              appLogger.error(`Could not decrypt open User Data Storage Visibility Groups Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting open data storage visibility groups' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not decrypt User Data Storage Visibility Groups Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting open data storage visibility groups' information changes.", variant: "error" });
          });
      }
    );

    return (): void => {
      appLogger.debug("Removing Signed In Root event listeners.");
      removeAvailableUserDataStoragesChangedListener();
      removeOpenUserDataStorageVisibilityGroupsChangedListener();
    };
  }, []);

  return appRootContext.signedInUserInfo !== null ? (
    <Outlet
      context={
        {
          ...appRootContext,
          signedInUserInfo: appRootContext.signedInUserInfo,
          userDataStoragesInfo: availableUserDataStoragesInfo,
          openUserDataStorageVisibilityGroupsInfo: openUserDataStorageVisibilityGroupsInfo,
          setForbiddenLocationName: URIencodeAndSetForbiddenLocationName
        } satisfies ISignedInRootContext
      }
    />
  ) : (
    <Navigate to={`/forbidden/you-must-be-signed-in-to-access-the-${forbiddenLocationName}-page`} />
  );
};

export default SignedInRoot;
