import Box from "@mui/material/Box/Box";
import DangerousIcon from "@mui/icons-material/Dangerous";
import { FC, useCallback, useEffect, useState } from "react";
import Paper from "@mui/material/Paper/Paper";
import Button from "@mui/material/Button/Button";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { appLogger } from "@renderer/utils/loggers";
import Typography from "@mui/material/Typography/Typography";
import Alert from "@mui/material/Alert/Alert";

export interface IForbiddenPageParams extends Record<string, string> {
  reason: string;
}

const ForbiddenPage: FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const params: Readonly<Partial<IForbiddenPageParams>> = useParams<IForbiddenPageParams>();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const handleBackToSignInButtonClick = useCallback((): void => {
    appLogger.debug("Back to sign in button clicked.");
    navigate("/", { replace: true });
  }, [navigate]);

  useEffect((): void => {
    try {
      if (params.reason !== undefined) {
        const DECODED_ALERT_MESSAGE: string = decodeURIComponent(params.reason.replaceAll("-", " "));
        if (DECODED_ALERT_MESSAGE.length >= 2) {
          setAlertMessage(DECODED_ALERT_MESSAGE.charAt(0).toUpperCase() + DECODED_ALERT_MESSAGE.slice(1));
        } else {
          setAlertMessage(DECODED_ALERT_MESSAGE.toUpperCase());
        }
      } else {
        setAlertMessage(null);
      }
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      appLogger.error(`Could not set alert message: ${ERROR_MESSAGE}!`);
      setAlertMessage(null);
    }
  }, [params.reason]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundImage: "linear-gradient(to top, #ff0844 0%, #ffb199 100%);"
      }}
    >
      <Paper
        elevation={24}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxHeight: "80%",
          padding: "2%",
          overflow: "auto"
        }}
      >
        <DangerousIcon color="error" sx={{ fontSize: 100 }} />
        <Typography variant="h4">Access Denied</Typography>
        {alertMessage && <Alert severity="error">{alertMessage}!</Alert>}
        <Button variant="contained" size="large" onClick={handleBackToSignInButtonClick} sx={{ marginTop: "2%" }}>
          Back to Sign In
        </Button>
      </Paper>
    </Box>
  );
};

export default ForbiddenPage;
