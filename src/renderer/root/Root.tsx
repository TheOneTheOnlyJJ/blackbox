import { FC, useEffect, useState } from "react";
import { appLogger, IPCLogger } from "../utils/loggers";
import { CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import { RootContext as RootContext } from "./RootContext";

const Root: FC = () => {
  const [isUserStorageAvailable, setIsUserStorageAvailable] = useState<boolean>(false);

  useEffect(() => {
    appLogger.info("Rendering App component.");
    IPCLogger.debug("Requesting user storage availability status.");
    window.userAPI
      .isStorageAvailable()
      .then(
        (value: boolean) => {
          setIsUserStorageAvailable(value);
          IPCLogger.debug("Received user storage availability status.");
        },
        (reason: unknown) => {
          IPCLogger.warn(`Could not get user storage availability status: ${String(reason)}.`);
        }
      )
      .catch(() => {
        IPCLogger.error(`Could not get user storage availability status.`);
      });
    // Monitor changes to user storage availability
    window.userAPI.onStorageAvailabilityChanged((isAvailable: boolean) => {
      IPCLogger.debug("Received user storage availability status change event.");
      appLogger.silly(`User storage available: ${isAvailable.toString()}.`);
      setIsUserStorageAvailable(isAvailable);
    });
  }, []);

  return (
    <>
      <CssBaseline />
      <Outlet
        context={
          {
            isUserStorageAvailable: isUserStorageAvailable
          } satisfies RootContext
        }
      />
    </>
  );
};

export default Root;
