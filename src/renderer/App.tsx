import { FC, useEffect, useState } from "react";
import { appLogger, IPCLogger } from "./loggers";
import { CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import { UserStorageConfig } from "../../src/shared/user/storage/types";
import { AppContext } from "./appContext";

const App: FC = () => {
  const [userStorageConfig, setUserStorageConfig] = useState<UserStorageConfig | null>(null);

  useEffect(() => {
    appLogger.info("Rendering App component.");
    IPCLogger.debug("Requesting user storage config.");
    window.userStorageAPI
      .getConfig()
      .then(
        (value: UserStorageConfig) => {
          setUserStorageConfig(value);
          IPCLogger.debug("Received user storage config.");
          IPCLogger.silly(`Config: ${JSON.stringify(value, null, 2)}.`);
          IPCLogger.debug("Requesting user storage initialisation.");
          void window.userStorageAPI.initialise();
        },
        (reason: unknown) => {
          IPCLogger.warn(`Could not get user storage config: ${String(reason)}.`);
        }
      )
      .catch(() => {
        IPCLogger.error(`Could not get user storage config.`);
      });
  }, []);

  return (
    <>
      <CssBaseline />
      <Outlet
        context={
          {
            userStorageConfig: userStorageConfig,
            setUserStorageConfig: setUserStorageConfig
          } satisfies AppContext
        }
      />
    </>
  );
};

export default App;
