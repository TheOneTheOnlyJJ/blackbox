import { FC, useCallback, useEffect, useState } from "react";
import { appLogger, IPCLogger } from "@renderer/utils/loggers";
import { Outlet, useLocation, Location, useNavigate, NavigateFunction } from "react-router-dom";
import { IAppRootContext } from "./AppRootContext";
import { arrayBufferToBase64 } from "@renderer/utils/typeConversions/arrayBufferToBase64";
import { insertLineBreaks } from "@shared/utils/insertNewLines";
import { ICurrentlySignedInUser } from "@shared/user/CurrentlySignedInUser";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPCAPIResponseStatus } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import Box from "@mui/material/Box/Box";

export interface IOpenNotificationSnackbarProps {
  autoHideDuration?: number;
  message: string;
}

const AppRoot: FC = () => {
  // General
  const location: Location = useLocation();
  const navigate: NavigateFunction = useNavigate();
  // Encryption
  const [rendererProcessAESKey, setRendererProcessAESKey] = useState<CryptoKey | null>(null);
  // User
  const [isUserAccountStorageAvailable, setIsUserAccountStorageAvailable] = useState<boolean>(false);
  const [currentlySignedInUser, setCurrentlySignedInUser] = useState<ICurrentlySignedInUser | null>(null);

  const generateRendererProcessAESEncryptionKey = useCallback(async (): Promise<void> => {
    appLogger.debug("Generating renderer process AES key.");
    appLogger.debug("Getting main process public RSA key.");
    const GET_MAIN_PROCESS_PUBLIC_RSA_KEY_DER_RESPONSE: IPCAPIResponse<ArrayBuffer> = window.IPCTLSAPI.getMainProcessPublicRSAKeyDER();
    if (GET_MAIN_PROCESS_PUBLIC_RSA_KEY_DER_RESPONSE.status !== IPCAPIResponseStatus.SUCCESS) {
      enqueueSnackbar({ message: "Error getting main process public RSA encryption key.", variant: "error" });
      return;
    }
    const MAIN_PROCESS_PUBLIC_RSA_KEY_DER: ArrayBuffer = GET_MAIN_PROCESS_PUBLIC_RSA_KEY_DER_RESPONSE.data;
    appLogger.debug(`Got main process public RSA key:\n${insertLineBreaks(arrayBufferToBase64(MAIN_PROCESS_PUBLIC_RSA_KEY_DER))}.`);
    // Import the main process public RSA key in the WebCryptoAPI CryptoKey format
    const MAIN_PROCESS_PUBLIC_RSA_KEY: CryptoKey = await window.crypto.subtle.importKey(
      "spki",
      MAIN_PROCESS_PUBLIC_RSA_KEY_DER,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      false,
      ["encrypt", "wrapKey"]
    );
    // Generate the renderer process AES key...
    const RENDERER_PROCESS_AES_KEY: CryptoKey = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
    // ...and set it as Root state
    setRendererProcessAESKey(RENDERER_PROCESS_AES_KEY);
    appLogger.debug("Renderer process AES key generated succesfully. Wrapping it with the main process public RSA key.");
    // Wrap the generated key with the main process' public RSA key...
    const WRAPPED_RENDERER_PROCESS_AES_KEY: ArrayBuffer = await window.crypto.subtle.wrapKey(
      "raw",
      RENDERER_PROCESS_AES_KEY,
      MAIN_PROCESS_PUBLIC_RSA_KEY,
      {
        name: "RSA-OAEP"
      }
    );
    appLogger.silly(`RSA-wrapped AES key:\n${insertLineBreaks(arrayBufferToBase64(WRAPPED_RENDERER_PROCESS_AES_KEY))}\n.`);
    // ...and send it to the main process
    if ((await window.IPCTLSAPI.sendRendererProcessWrappedAESKey(WRAPPED_RENDERER_PROCESS_AES_KEY)).status !== IPCAPIResponseStatus.SUCCESS) {
      enqueueSnackbar({ message: "Error sending AES encryption key to main process.", variant: "error" });
    }
  }, [setRendererProcessAESKey]);

  // Log every location change
  useEffect((): void => {
    appLogger.debug(`Navigated to: "${location.pathname}".`);
  }, [location]);

  // Navigate on sign in/out
  useEffect((): void => {
    appLogger.debug(`Currently signed in user state changed: ${JSON.stringify(currentlySignedInUser, null, 2)}.`);
    let navigationPath: string;
    if (currentlySignedInUser === null) {
      navigationPath = "/";
    } else {
      navigationPath = `/users/${currentlySignedInUser.username}/dashboard`;
    }
    // Wipe the history stack and navigate to the required path
    appLogger.debug("Wiping window navigation history.");
    window.history.replaceState({ idx: 0 }, "", navigationPath);
    navigate(navigationPath, { replace: true });
  }, [navigate, currentlySignedInUser]);

  // Log user account storage availability changes
  useEffect((): void => {
    appLogger.debug(`User Account Storage availability changed: ${isUserAccountStorageAvailable.toString()}.`);
  }, [isUserAccountStorageAvailable]);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering App Root component.");
    generateRendererProcessAESEncryptionKey()
      .then(
        (): void => {
          appLogger.debug("Done generating renderer process AES key.");
        },
        (reason: unknown): void => {
          const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
          appLogger.error(`Failed to generate renderer process AES key: ${REASON_MESSAGE}.`);
        }
      )
      .catch((err: unknown): void => {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        appLogger.error(`Failed to generate renderer process AES key: ${ERROR_MESSAGE}.`);
      });
    const IS_USER_STORAGE_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.isAccountStorageAvailable();
    if (IS_USER_STORAGE_AVAILABLE_RESPONSE.status !== IPCAPIResponseStatus.SUCCESS) {
      enqueueSnackbar({ message: "Error getting User Account Storage availability.", variant: "error" });
      setIsUserAccountStorageAvailable(false);
    } else {
      setIsUserAccountStorageAvailable(IS_USER_STORAGE_AVAILABLE_RESPONSE.data);
    }
    const GET_CURRENTLY_SIGNED_IN_USER_RESPONSE: IPCAPIResponse<ICurrentlySignedInUser | null> = window.userAPI.getCurrentlySignedInUser();
    if (GET_CURRENTLY_SIGNED_IN_USER_RESPONSE.status !== IPCAPIResponseStatus.SUCCESS) {
      enqueueSnackbar({ message: "Error getting currently signed in user.", variant: "error" });
      setCurrentlySignedInUser(null);
    } else {
      setCurrentlySignedInUser(GET_CURRENTLY_SIGNED_IN_USER_RESPONSE.data);
    }
    // Monitor changes to currently signed in user
    const REMOVE_ON_CURRENTLY_SIGNED_IN_USER_CHANGE_LISTENER: () => void = window.userAPI.onCurrentlySignedInUserChange(
      (newSignedInUser: ICurrentlySignedInUser | null): void => {
        IPCLogger.debug("Received new currently signed in user event.");
        setCurrentlySignedInUser(newSignedInUser);
      }
    );
    // Monitor changes to user account storage availability status
    const REMOVE_ON_USER_ACCOUNT_STORAGE_AVAILABILITY_CHANGE_LISTENER: () => void = window.userAPI.onAccountStorageAvailabilityChange(
      (isUserAccountStorageAvailable: boolean): void => {
        IPCLogger.debug("Received User Account Storage availability status change event.");
        setIsUserAccountStorageAvailable(isUserAccountStorageAvailable);
      }
    );
    return () => {
      appLogger.debug("Removing App Root event listeners.");
      REMOVE_ON_CURRENTLY_SIGNED_IN_USER_CHANGE_LISTENER();
      REMOVE_ON_USER_ACCOUNT_STORAGE_AVAILABILITY_CHANGE_LISTENER();
    };
  }, [generateRendererProcessAESEncryptionKey]);

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <SnackbarProvider
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        maxSnack={1 /* Adhering to Material Design guidelines */}
        autoHideDuration={5_000}
      />
      <Outlet
        context={
          {
            rendererProcessAESKey: rendererProcessAESKey,
            currentlySignedInUser: currentlySignedInUser,
            isUserAccountStorageAvailable: isUserAccountStorageAvailable
          } satisfies IAppRootContext
        }
      />
    </Box>
  );
};

export default AppRoot;
