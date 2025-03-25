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
import { appLogger } from "@renderer/utils/loggers";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";

export interface ISuccessfulUserSignUpDialogProps {
  open: DialogProps["open"];
  username: string;
  userCount: number | null;
  encryptedNewUserSignInDTO: IEncryptedData<IUserSignInDTO> | null;
}

const SuccessfulUserSignUpDialog: FC<ISuccessfulUserSignUpDialogProps> = (props: ISuccessfulUserSignUpDialogProps) => {
  const navigate: NavigateFunction = useNavigate();
  const [signInError, setSignInError] = useState<boolean>(false);

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
    if (props.encryptedNewUserSignInDTO === null) {
      appLogger.debug("Null encrypted new user sign in DTO. No-op.");
      enqueueSnackbar({ message: "Missing encrypted sign in credentials.", variant: "error" });
      return;
    }
    const SIGN_IN_RESPONSE: IPCAPIResponse<boolean> = window.userAuthAPI.signIn(props.encryptedNewUserSignInDTO);
    // Automatic sign in should always work for a newly signed up account
    if (SIGN_IN_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      if (SIGN_IN_RESPONSE.data) {
        appLogger.info("Automatic sign in successful.");
        setSignInError(false);
        enqueueSnackbar({ message: `${props.username} signed in.`, variant: "info" });
      } else {
        appLogger.error("Automatic sign in unsuccessful!");
        setSignInError(true);
        enqueueSnackbar({ message: `Failed signing ${props.username} in.`, variant: "error" });
      }
    } else {
      appLogger.error(`Automatic sign in error: ${SIGN_IN_RESPONSE.error}!`);
      setSignInError(true);
      enqueueSnackbar({ message: "Automatic sign in error.", variant: "error" });
    }
  }, [props.encryptedNewUserSignInDTO, props.username]);

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
            <AlertTitle>Welcome, {props.username}</AlertTitle>
            {props.userCount !== null
              ? `You're the ${ordinalize(props.userCount.toString())} registered BlackBox user!`
              : "You're now a registered BlackBox user!"}
          </Alert>
          {signInError && (
            <Alert severity="error">
              <AlertTitle>Automatic sign in failed!</AlertTitle>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant={props.encryptedNewUserSignInDTO === null ? "contained" : "outlined"} onClick={handleBackToSignInButtonClick}>
          Back to Sign In
        </Button>
        {props.encryptedNewUserSignInDTO !== null ? (
          <Button variant="contained" onClick={handleStartExploringButtonClick}>
            Start Exploring
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default SuccessfulUserSignUpDialog;
