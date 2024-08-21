import { FC, useCallback, useEffect, useState } from "react";
import { appLogger, IPCLogger } from "../utils/loggers";
import { Outlet } from "react-router-dom";
import { RootContext } from "./RootContext";
import { stringToArrayBuffer } from "../utils/stringToArrayBuffer";
import { arrayBufferToBase64 } from "../utils/arrayBufferToBase64";
import { insertLineBreaks } from "../../shared/utils/insertNewLines";

const Root: FC = () => {
  // TODO: Add suspense "Waiting for secure connection" screen
  // TODO: Optimize Material UI imports
  // TODO: Actually encrypt sensitive traffic (user data)
  const [isUserStorageAvailable, setIsUserStorageAvailable] = useState<boolean>(window.userAPI.isStorageAvailable());
  const [rendererProcessAESKey, setRendererProcessAESKey] = useState<CryptoKey | null>(null);

  const generateRendererProcessAESEncryptionKey = useCallback(async () => {
    appLogger.debug("Generating renderer process AES encryption key and sending it to the main process.");
    appLogger.debug("Getting main process public RSA key.");
    const MAIN_PROCESS_PUBLIC_RSA_KEY_PEM: string = window.IPCEncryptionAPI.getMainProcessPublicRSAKeyPEM();
    appLogger.debug(`Got main process public RSA key:\n${MAIN_PROCESS_PUBLIC_RSA_KEY_PEM}.`);

    // Obtain main process public RSA key in ArrayBuffer format...
    const PEM_HEADER = "-----BEGIN PUBLIC KEY-----";
    const PEM_FOOTER = "-----END PUBLIC KEY-----";
    const MAIN_PROCESS_PUBLIC_RSA_KEY_PEM_CONTENTS = MAIN_PROCESS_PUBLIC_RSA_KEY_PEM.replace(PEM_HEADER, "")
      .replace(PEM_FOOTER, "")
      .replace(/\s+/g, ""); // Remove all whitespace/newlines
    const MAIN_PROCESS_PUBLIC_RSA_KEY_DER_BASE_64: string = window.atob(MAIN_PROCESS_PUBLIC_RSA_KEY_PEM_CONTENTS);
    const MAIN_PROCESS_PUBLIC_RSA_KEY_DER: ArrayBuffer = stringToArrayBuffer(MAIN_PROCESS_PUBLIC_RSA_KEY_DER_BASE_64);
    appLogger.debug("Reformatted main process public RSA key from PEM to DER.");
    // ...and import it in the WebCryptoAPI CryptoKey format
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

  useEffect(() => {
    appLogger.info("Rendering Root component.");
    generateRendererProcessAESEncryptionKey()
      .then(
        () => {
          appLogger.debug("Done generating renderer process AES key.");
        },
        (reason: unknown) => {
          const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
          appLogger.error(`Failed to generate renderer process AES key: ${REASON_MESSAGE}.`);
        }
      )
      .catch((err: unknown) => {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        appLogger.error(`Failed to generate renderer process AES key: ${ERROR_MESSAGE}.`);
      });
    appLogger.debug(`User storage availability status: ${isUserStorageAvailable.toString()}.`);
    // Monitor changes to user storage availability status
    window.userAPI.onStorageAvailabilityChange((isAvailable: boolean) => {
      IPCLogger.debug(`Received user storage availability status change event. Storage available: ${isAvailable.toString()}.`);
      setIsUserStorageAvailable(isAvailable);
    });
  }, []);

  return (
    <Outlet
      context={
        {
          rendererProcessAESKey: rendererProcessAESKey,
          isUserStorageAvailable: isUserStorageAvailable
        } satisfies RootContext
      }
    />
  );
};

export default Root;
