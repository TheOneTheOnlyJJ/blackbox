import Dialog from "@mui/material/Dialog/Dialog";
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
import { IEncryptedUserSignInCredentials } from "../../shared/user/encrypted/IEncryptedUserSignInCredentials";
import { appLogger } from "../utils/loggers";
import { IPCAPIResponse } from "../../shared/IPC/IPCAPIResponse";
import { IPCAPIResponseStatus } from "../../shared/IPC/IPCAPIResponseStatus";

export interface SuccessfulUserSignUpDialogProps {
  open: boolean;
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
      return;
    }
    appLogger.debug("Attempting sign in.");
    const SIGN_IN_RESPONSE: IPCAPIResponse = window.userAPI.signIn(props.encryptedNewUserSignInCredentials);
    if (SIGN_IN_RESPONSE.status === IPCAPIResponseStatus.SUCCESS) {
      appLogger.debug("Sign in successful.");
      setSignInError(undefined);
    } else {
      appLogger.debug("Sign in unsuccessful.");
      setSignInError(SIGN_IN_RESPONSE.error);
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
            Sign Up successful
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
