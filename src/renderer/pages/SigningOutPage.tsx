import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import Paper from "@mui/material/Paper/Paper";
import { FC, useEffect } from "react";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import { appLogger } from "@renderer/utils/loggers";

const SigningOutPage: FC = () => {
  useEffect(() => {
    //setTimeout(() => {
    appLogger.debug("Signing out.");
    const SIGN_OUT_RESPONSE: IPCAPIResponse = window.userAPI.signOut();
    if (SIGN_OUT_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({ message: "Signed out." });
    } else {
      enqueueSnackbar({ message: "Sign out error.", variant: "error" });
    }
    //}, 5_000);
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

export default SigningOutPage;
