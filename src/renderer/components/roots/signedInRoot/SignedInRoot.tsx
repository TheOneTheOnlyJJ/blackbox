import { FC, useCallback, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { IAppRootContext, useAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { ISignedInRootContext } from "./SignedInRootContext";
import { appLogger } from "@renderer/utils/loggers";
import {
  IPublicUserDataStorageConfig,
  PUBLIC_USER_DATA_STORAGE_CONFIGS_VALIDATE_FUNCTION
} from "@shared/user/data/storage/config/public/PublicUserDataStorageConfig";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import {
  IPublicUserDataStoragesChangedDiff,
  PUBLIC_USER_DATA_STORAGES_CHANGED_DIFF_VALIDATE_FUNCTION
} from "@shared/user/data/storage/config/public/PublicUserDataStoragesChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";

const SignedInRoot: FC = () => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const [forbiddenLocationName, setForbiddenLocationName] = useState<string>("this-page");
  const URIencodeAndSetForbiddenLocationName = useCallback((newForbiddenLocationname: string): void => {
    try {
      newForbiddenLocationname = encodeURIComponent(newForbiddenLocationname);
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      appLogger.error(`Could not set forbidden location name: ${ERROR_MESSAGE}!`);
      newForbiddenLocationname = "this-page";
    } finally {
      setForbiddenLocationName(newForbiddenLocationname);
    }
  }, []);
  // Public User Data Storage Configs
  const [publicUserDataStorageConfigs, setPublicUserDataStorageConfigs] = useState<IPublicUserDataStorageConfig[]>([]);

  useEffect((): void => {
    appLogger.info(`Public User Data Storage Configs changed. Count: ${publicUserDataStorageConfigs.length.toString()}.`);
  }, [publicUserDataStorageConfigs]);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering Signed In Root component.");
    // Get all Public User Data Storage Configs
    const GET_ALL_SIGNED_IN_USER_PUBLIC_USER_DATA_STORAGE_CONFIGS_RESPONSE: IPCAPIResponse<IEncryptedData<IPublicUserDataStorageConfig[]>> =
      window.userAPI.getAllSignedInUserPublicUserDataStorageConfigs();
    if (GET_ALL_SIGNED_IN_USER_PUBLIC_USER_DATA_STORAGE_CONFIGS_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      appLogger.error(
        `Could not get all signed in user Public User Data Storage Configs! Reason: ${GET_ALL_SIGNED_IN_USER_PUBLIC_USER_DATA_STORAGE_CONFIGS_RESPONSE.error}!`
      );
      enqueueSnackbar({ message: "Error getting Data Storage configurations.", variant: "error" });
    } else {
      window.IPCTLSAPI.decryptAndValidateJSON<IPublicUserDataStorageConfig[]>(
        GET_ALL_SIGNED_IN_USER_PUBLIC_USER_DATA_STORAGE_CONFIGS_RESPONSE.data,
        PUBLIC_USER_DATA_STORAGE_CONFIGS_VALIDATE_FUNCTION,
        "all signed in user Public User Data Storage Configs"
      )
        .then(
          (allSignedInUserPublicUserDataStorageConfigs: IPublicUserDataStorageConfig[]): void => {
            setPublicUserDataStorageConfigs(allSignedInUserPublicUserDataStorageConfigs);
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not decrypt all signed in user Public User Data Storage Configs. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Public User Data Storage configurations decryption error.", variant: "error" });
          }
        )
        .catch((err: unknown): void => {
          const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
          appLogger.error(`Could not decrypt all signed in user Public User Data Storage Configs. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Public User Data Storage configurations decryption error.", variant: "error" });
        });
    }
    // Monitor changes to User Data Storages
    const removeUserDataStoragesChangedListener: () => void = window.userAPI.onUserDataStoragesChanged(
      (encryptedPublicUserDataStoragesChangedDiff: IEncryptedData<IPublicUserDataStoragesChangedDiff>): void => {
        window.IPCTLSAPI.decryptAndValidateJSON(
          encryptedPublicUserDataStoragesChangedDiff,
          PUBLIC_USER_DATA_STORAGES_CHANGED_DIFF_VALIDATE_FUNCTION,
          "Public User Data Storages Changed Diff"
        )
          .then(
            (publicUserDataStoragesChangedDiff: IPublicUserDataStoragesChangedDiff): void => {
              setPublicUserDataStorageConfigs((prevPublicUserDataStorageConfigs: IPublicUserDataStorageConfig[]): IPublicUserDataStorageConfig[] => {
                return [
                  ...prevPublicUserDataStorageConfigs.filter((config: IPublicUserDataStorageConfig): boolean => {
                    return !publicUserDataStoragesChangedDiff.deleted.includes(config.storageId);
                  }),
                  ...publicUserDataStoragesChangedDiff.added
                ];
              });
            },
            (reason: unknown): void => {
              const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
              appLogger.error(`Could not decrypt Public User Data Storages Changed Diff. Reason: ${REASON_MESSAGE}.`);
              enqueueSnackbar({ message: "Public User Data Storages changes decryption error.", variant: "error" });
            }
          )
          .catch((reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not decrypt Public User Data Storages Changed Diff. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Public User Data Storages changes decryption error.", variant: "error" });
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
          publicUserDataStorageConfigs: publicUserDataStorageConfigs,
          setForbiddenLocationName: URIencodeAndSetForbiddenLocationName
        } satisfies ISignedInRootContext
      }
    />
  ) : (
    <Navigate to={`/forbidden/must-be-signed-in-to-access-${forbiddenLocationName}`} />
  );
};

export default SignedInRoot;
