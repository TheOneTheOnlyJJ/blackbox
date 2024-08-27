import { FC, useCallback, useEffect, useState } from "react";
import { appLogger, IPCLogger } from "../utils/loggers";
import { Outlet, useLocation, Location } from "react-router-dom";
import { AppRootContext } from "./AppRootContext";
import { arrayBufferToBase64 } from "../utils/typeConversions/arrayBufferToBase64";
import { insertLineBreaks } from "../../shared/utils/insertNewLines";
import { ICurrentlyLoggedInUser } from "../../shared/user/ICurrentlyLoggedInUser";

const AppRoot: FC = () => {
  // TODO: Add suspense "Waiting for secure connection" screen
  const location: Location = useLocation();
  const [rendererProcessAESKey, setRendererProcessAESKey] = useState<CryptoKey | null>(null);
  const [currentlyLoggedInUser, setCurrentlyLoggedInUser] = useState<ICurrentlyLoggedInUser | null>(null);
  const [isUserStorageAvailable, setIsUserStorageAvailable] = useState<boolean>(window.userAPI.isStorageAvailable());

  const generateRendererProcessAESEncryptionKey = useCallback(async (): Promise<void> => {
    appLogger.debug("Getting main process public RSA key.");
    const MAIN_PROCESS_PUBLIC_RSA_KEY_DER: ArrayBuffer = window.IPCEncryptionAPI.getMainProcessPublicRSAKeyDER();
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
    const IS_WRAPPED_RENDERER_PROCESS_AES_KEY_VALID: boolean = await window.IPCEncryptionAPI.sendRendererProcessWrappedAESKey(
      WRAPPED_RENDERER_PROCESS_AES_KEY
    );
    if (IS_WRAPPED_RENDERER_PROCESS_AES_KEY_VALID) {
      appLogger.debug("Main process successfully validated renderer process AES key.");
    } else {
      appLogger.error("Main process could not validate renderer process AES key!");
    }
  }, [setRendererProcessAESKey]);

  // Log every location change
  useEffect((): void => {
    appLogger.debug(`Navigated to: "${location.pathname}".`);
  }, [location]);

  useEffect((): void => {
    appLogger.info("Rendering Root component.");
    appLogger.debug("Generating renderer process AES key.");
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
    appLogger.debug(`User storage availability status: ${isUserStorageAvailable.toString()}.`);
    // Monitor changes to currently logged in user
    window.userAPI.onCurrentlyLoggedInUserChange((newLoggedInUser: ICurrentlyLoggedInUser | null): void => {
      IPCLogger.debug(`Received new currently logged in user event. New currently logged in user: ${JSON.stringify(newLoggedInUser, null, 2)}.`);
      setCurrentlyLoggedInUser(newLoggedInUser);
    });
    // Monitor changes to user storage availability status
    window.userAPI.onUserStorageAvailabilityChange((isAvailable: boolean): void => {
      IPCLogger.debug(`Received user storage availability status change event. Storage available: ${isAvailable.toString()}.`);
      setIsUserStorageAvailable(isAvailable);
    });
  }, []);

  return (
    <Outlet
      context={
        {
          rendererProcessAESKey: rendererProcessAESKey,
          currentlyLoggedInUser: currentlyLoggedInUser,
          isUserStorageAvailable: isUserStorageAvailable
        } satisfies AppRootContext
      }
    />
  );
};

export default AppRoot;
