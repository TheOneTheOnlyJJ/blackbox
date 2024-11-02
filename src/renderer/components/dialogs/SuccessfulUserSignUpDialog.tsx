import Dialog, { DialogProps } from "@mui/material/Dialog/Dialog";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { FC, useCallback, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ordinalize } from "inflection";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import Button from "@mui/material/Button/Button";
import { IEncryptedUserSignInCredentials } from "@shared/user/encrypted/IEncryptedUserSignInCredentials";
import { appLogger } from "@renderer/utils/loggers";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPCAPIResponseStatus } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";

export interface SuccessfulUserSignUpDialogProps {
  open: DialogProps["open"];
  username: string;
  userCount: number | null;
  encryptedNewUserSignInCredentials: IEncryptedUserSignInCredentials | null;
}

const SuccessfulUserRegistrationDialog: FC<SuccessfulUserSignUpDialogProps> = (props: SuccessfulUserSignUpDialogProps) => {
  const navigate: NavigateFunction = useNavigate();
  const [signInError, setSignInError] = useState<string | undefined>(undefined);
  const handleDialogClose = useCallback((): void => {
    // This ensures no backdrop click or escape keypress closes the dialog
    return;
  }, []);
  const handleBackToSignInButtonClick = useCallback((): void => {
    appLogger.debug("Back to sign in button clicked.");
    navigate("/");
  }, [navigate]);
  const handleStartExploringButtonClick = useCallback((): void => {
    appLogger.debug("Start exploring button clicked.");
    if (props.encryptedNewUserSignInCredentials === null) {
      appLogger.debug("Null encrypted new user sign in credentials. No-op.");
      enqueueSnackbar({ message: "Missing encrypted sign in credentials.", variant: "error" });
      return;
    }
    appLogger.debug("Attempting sign in.");
    const SIGN_IN_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.signIn(props.encryptedNewUserSignInCredentials);
    // Automatic sign in should always work for a newly signed up account
    if (SIGN_IN_RESPONSE.status === IPCAPIResponseStatus.SUCCESS) {
      if (SIGN_IN_RESPONSE.data) {
        appLogger.debug("Sign in successful.");
        setSignInError(undefined);
        enqueueSnackbar({ message: "Signed in." });
      } else {
        appLogger.debug("Sign in unsuccessful.");
        setSignInError("Automatic sign in unsuccessful");
        enqueueSnackbar({ message: "Automatic sign in unsuccessful.", variant: "error" });
      }
    } else {
      appLogger.debug("Sign in error.");
      setSignInError(SIGN_IN_RESPONSE.error);
      enqueueSnackbar({ message: "Sign in error.", variant: "error" });
    }
  }, [props.encryptedNewUserSignInCredentials, setSignInError]);

  return (
    <Dialog maxWidth="xl" open={props.open} onClose={handleDialogClose}>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CheckCircleOutlineOutlinedIcon color="success" sx={{ fontSize: 100 }} />
          <Typography variant="h5" sx={{ marginBottom: "1vw" }}>
            Sign up successful
          </Typography>
          <Alert severity="success" sx={{ marginBottom: "1vw" }}>
            <AlertTitle>Congratulations {props.username}!</AlertTitle>
            {props.userCount !== null
              ? `You're the ${ordinalize(props.userCount.toString())} registered BlackBox user!`
              : "You're now a registered BlackBox user!"}
          </Alert>
          {signInError && (
            <Alert severity="error">
              <AlertTitle>Automatic sign in failed!</AlertTitle>
              {signInError}!
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant={props.encryptedNewUserSignInCredentials === null ? "contained" : "outlined"} onClick={handleBackToSignInButtonClick}>
          Back to Sign In
        </Button>
        {props.encryptedNewUserSignInCredentials !== null ? (
          <Button variant="contained" onClick={handleStartExploringButtonClick}>
            Start Exploring
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default SuccessfulUserRegistrationDialog;
