import { FC, useEffect, useState } from "react";
import { appLogger, IPCLogger } from "../utils/loggers";
import { Outlet } from "react-router-dom";
import { RootContext } from "./RootContext";

const Root: FC = () => {
  const [mainProcessPublicRSAKey] = useState<string>(window.IPCEncryptionAPI.getMainProcessPublicRSAKey());
  const [isUserStorageAvailable, setIsUserStorageAvailable] = useState<boolean>(window.userAPI.isStorageAvailable());

  useEffect(() => {
    appLogger.info("Rendering App component.");
    appLogger.debug(`Public IPC encryption key: ${mainProcessPublicRSAKey}.`);
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
          mainProcessPublicRSAKey: mainProcessPublicRSAKey,
          isUserStorageAvailable: isUserStorageAvailable
        } satisfies RootContext
      }
    />
  );
};

export default Root;
