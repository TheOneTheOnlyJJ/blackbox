import { FC, useEffect, useState } from "react";
import { appLogger, IPCLogger } from "../utils/loggers";
import { CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import { RootContext as RootContext } from "./RootContext";

const Root: FC = () => {
  const [publicIPCEncryptionKey, setPublicIPCEncryptionKey] = useState<string | null>(null);
  const [isUserStorageAvailable, setIsUserStorageAvailable] = useState<boolean>(false);

  useEffect(() => {
    appLogger.info("Rendering App component.");
    IPCLogger.debug("Requesting user storage availability status.");
    // Get IPC public encryption key
    setPublicIPCEncryptionKey(window.IPCEncryptionAPI.getPublicKey());
    // Get initial user storage availability status
    setIsUserStorageAvailable(window.userAPI.isStorageAvailable());
    // Monitor changes to user storage availability status
    window.userAPI.onStorageAvailabilityChange((isAvailable: boolean) => {
      IPCLogger.debug(`Received user storage availability status change event. Storage available: ${isAvailable.toString()}.`);
      setIsUserStorageAvailable(isAvailable);
    });
  }, []);

  return (
    <>
      <CssBaseline />
      <Outlet
        context={
          {
            publicIPCEncryptionKey: publicIPCEncryptionKey,
            isUserStorageAvailable: isUserStorageAvailable
          } satisfies RootContext
        }
      />
    </>
  );
};

export default Root;
