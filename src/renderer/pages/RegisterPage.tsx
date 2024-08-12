import { Box, Button, Typography } from "@mui/material";
import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../appContext";
import { IPCLogger } from "../loggers";

const RegisterPage: FC = () => {
  const appContext = useAppContext();
  const [userStorageClosingStatus, setUserStorageClosingStatus] = useState<string>("Close user storage by clicking button.");
  return (
    <Box>
      <Typography>Register Page</Typography>
      <Typography>
        {appContext.userStorageConfig !== null
          ? `Registering to ${appContext.userStorageConfig.type} user storage`
          : "No user storage initialised. Cannot register new user."}
      </Typography>
      <Button variant="contained" disabled={appContext.userStorageConfig === null}>
        Register
      </Button>
      <Button
        variant="outlined"
        disabled={appContext.userStorageConfig === null}
        onClick={() => {
          IPCLogger.debug("Sending user storage close request.");
          window.userStorageAPI
            .close()
            .then(
              (closeResult: boolean | null) => {
                if (closeResult === null) {
                  IPCLogger.debug("User storage was not initialised.");
                  setUserStorageClosingStatus("User storage was not initialised.");
                } else {
                  if (closeResult) {
                    IPCLogger.debug("Closed user storage.");
                    setUserStorageClosingStatus("Closed user storage.");
                    appContext.setUserStorageConfig(null);
                  } else {
                    IPCLogger.debug("Could not close user storage.");
                    setUserStorageClosingStatus("Could not close user storage.");
                  }
                }
              },
              (reason: unknown) => {
                IPCLogger.warn(`Could not close user storage. Reason: ${String(reason)}.`);
              }
            )
            .catch(() => {
              IPCLogger.error("Could not close user storage.");
            });
        }}
      >
        Close User Storage
      </Button>
      <Typography>{userStorageClosingStatus}</Typography>
      <Link to="/">Back to home</Link>
    </Box>
  );
};

export default RegisterPage;
