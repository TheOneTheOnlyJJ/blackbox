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
    // Get initial user storage availability status
    window.userAPI
      .isStorageAvailable()
      .then(
        (isAvailable: boolean) => {
          IPCLogger.debug(`Received user storage availability status. Storage available: ${isAvailable.toString()}.`);
          setIsUserStorageAvailable(isAvailable);
        },
        (reason: unknown) => {
          IPCLogger.warn(`Could not get user storage availability status: ${String(reason)}.`);
        }
      )
      .catch(() => {
        IPCLogger.error(`Could not get user storage availability status.`);
      });
    // Monitor changes to user storage availability status
    window.userAPI.onStorageAvailabilityChanged((isAvailable: boolean) => {
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
            isUserStorageAvailable: isUserStorageAvailable
          } satisfies RootContext
        }
      />
    </>
  );
};

export default Root;
