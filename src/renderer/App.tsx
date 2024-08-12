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
    IPCLogger.debug("Requesting user storage default config.");
    window.userStorageAPI
      .getDefaultConfig()
      .then(
        (value: UserStorageConfig) => {
          setUserStorageConfig(value);
          IPCLogger.debug("Received user storage default config.");
          IPCLogger.silly(`Default config: ${JSON.stringify(value, null, 2)}.`);
          IPCLogger.debug("Requesting new user storage with the default config.");
          void window.userStorageAPI.new(value);
        },
        (reason: unknown) => {
          IPCLogger.warn(`Could not get default user storage config: ${String(reason)}.`);
        }
      )
      .catch(() => {
        IPCLogger.error(`Could not get default user storage config.`);
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
