import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import Paper from "@mui/material/Paper/Paper";
import { FC, useEffect } from "react";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import log, { LogFunctions } from "electron-log";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";

const signOutPageLogger: LogFunctions = log.scope("renderer-sign-out-page");

const SignOutPage: FC = () => {
  useEffect((): void => {
    // TODO: Delete comment
    // setTimeout(() => {
    const SIGN_OUT_RESPONSE: IPCAPIResponse<IPublicSignedInUser | null> = window.userAPI.signOut();
    if (SIGN_OUT_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      if (SIGN_OUT_RESPONSE.data === null) {
        signOutPageLogger.warn("No user was signed in.");
      } else {
        signOutPageLogger.info(`Signed out user: ${JSON.stringify(SIGN_OUT_RESPONSE.data, null, 2)}.`);
        enqueueSnackbar({ message: `${SIGN_OUT_RESPONSE.data.username} signed out.`, variant: "info" });
      }
    } else {
      signOutPageLogger.error("Sign out error!");
      enqueueSnackbar({ message: "Sign out error.", variant: "error" });
    }
    // }, 2_500);
  }, []);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundImage: `linear-gradient(-45deg, #FFC796 0%, #FF6B95 100%)`
      }}
    >
      <Paper
        elevation={24}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          minWidth: "40%",
          maxHeight: "80%",
          padding: "2%",
          overflow: "auto"
        }}
      >
        <Typography variant="h1">Signing Out...</Typography>
      </Paper>
    </Box>
  );
};

export default SignOutPage;
