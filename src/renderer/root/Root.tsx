import { FC, useEffect, useState } from "react";
import { appLogger, IPCLogger } from "../utils/loggers";
import { CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import { RootContext as RootContext } from "./RootContext";

const Root: FC = () => {
  const [isUserStorageInitialised, setIsUserStorageInitialised] = useState<boolean>(false);

  useEffect(() => {
    appLogger.info("Rendering App component.");
    IPCLogger.debug("Requesting user storage config.");
    window.userAPI
      .isStorageInitialised()
      .then(
        (value: boolean) => {
          setIsUserStorageInitialised(value);
          IPCLogger.debug("Received user storage initialisation status.");
        },
        (reason: unknown) => {
          IPCLogger.warn(`Could not get user storage initialisation status: ${String(reason)}.`);
        }
      )
      .catch(() => {
        IPCLogger.error(`Could not get user storage initialisation status.`);
      });
  }, []);

  return (
    <>
      <CssBaseline />
      <Outlet
        context={
          {
            isUserStorageInitialised: isUserStorageInitialised
          } satisfies RootContext
        }
      />
    </>
  );
};

export default Root;
