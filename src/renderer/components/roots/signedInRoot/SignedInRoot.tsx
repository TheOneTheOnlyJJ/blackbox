import { FC, useCallback, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { IAppRootContext, useAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { ISignedInRootContext } from "./SignedInRootContext";
import { appLogger } from "@renderer/utils/loggers";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import {
  IUserDataStorageVisibilityGroupInfo,
  isValidUserDataStorageVisibilityGroupInfoArray
} from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import {
  IUserDataStorageVisibilityGroupsInfoChangedDiff,
  isValidUserDataStorageVisibilityGroupsInfoChangedDiff
} from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";
import { isValidUserDataStorageConfigInfoArray, IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import {
  isValidUserDataStorageConfigsInfoChangedDiff,
  IUserDataStorageConfigsInfoChangedDiff
} from "@shared/user/data/storage/config/info/UserDataStorageConfigsInfoChangedDiff";

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
  const [availableUserDataStorageConfigsInfo, setAvailableUserDataStorageConfigsInfo] = useState<IUserDataStorageConfigInfo[]>([]);
  const [openUserDataStorageVisibilityGroupsInfo, setOpenUserDataStorageVisibilityGroupsInfo] = useState<IUserDataStorageVisibilityGroupInfo[]>([]);

  useEffect((): void => {
    appLogger.info(`Available User Data Storage Configs Info changed. Count: ${availableUserDataStorageConfigsInfo.length.toString()}.`);
  }, [availableUserDataStorageConfigsInfo]);

  useEffect((): void => {
    appLogger.info(`Open User Data Storage Visibility Groups Info changed. Count: ${openUserDataStorageVisibilityGroupsInfo.length.toString()}.`);
  }, [openUserDataStorageVisibilityGroupsInfo]);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering Signed In Root component.");
    // Get all available User Data Storage Configs
    const GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGE_CONFIGS_INFO_RESPONSE: IPCAPIResponse<IEncryptedData<IUserDataStorageConfigInfo[]>> =
      window.userAPI.getAllSignedInUserAvailableDataStorageConfigsInfo();
    if (GET_ALL_SIGNED_IN_USER_AVAILABLE_DATA_STORAGE_CONFIGS_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      appLogger.error(
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
            appLogger.error(`Could not decrypt all signed in user's available User Data Storage Configs Info. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting data storage configs' information.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not decrypt all signed in user's available User Data Storage Configs Info. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Error decrypting data storage configs' information.", variant: "error" });
        });
    }
    // Monitor changes to User Data Storages Info
    const removeAvailableUserDataStorageConfigsChangedListener: () => void = window.userAPI.onAvailableUserDataStorageConfigsChanged(
      (encryptedAvailableUserDataStorageConfigsInfoChangedDiff: IEncryptedData<IUserDataStorageConfigsInfoChangedDiff>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON<IUserDataStorageConfigsInfoChangedDiff>(
          encryptedAvailableUserDataStorageConfigsInfoChangedDiff,
          isValidUserDataStorageConfigsInfoChangedDiff,
          "available User Data Storage Configs Info Changed Diff"
        )
          .then(
            (availableUserDataStorageConfigsInfoChangedDiff: IUserDataStorageConfigsInfoChangedDiff): void => {
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
              appLogger.error(`Could not decrypt available User Data Storage Configs Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Error decrypting available data storage configs' information changes.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not decrypt available User Data Storage Configs Info Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Error decrypting available data storage configs' information changes.", variant: "error" });
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
        isValidUserDataStorageVisibilityGroupInfoArray,
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
          isValidUserDataStorageVisibilityGroupsInfoChangedDiff,
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
      removeAvailableUserDataStorageConfigsChangedListener();
      removeOpenUserDataStorageVisibilityGroupsChangedListener();
    };
  }, []);

  return appRootContext.signedInUserInfo !== null ? (
    <Outlet
      context={
        {
          ...appRootContext,
          signedInUserInfo: appRootContext.signedInUserInfo,
          availableUserDataStorageConfigsInfo: availableUserDataStorageConfigsInfo,
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
