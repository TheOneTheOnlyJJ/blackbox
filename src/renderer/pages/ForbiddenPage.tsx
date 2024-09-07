import Box from "@mui/material/Box/Box";
import DangerousIcon from "@mui/icons-material/Dangerous";
import { FC, useCallback } from "react";
import Paper from "@mui/material/Paper/Paper";
import Button from "@mui/material/Button/Button";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { appLogger } from "../utils/loggers";
import Typography from "@mui/material/Typography/Typography";
import { humanize } from "inflection";
import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";

export interface ForbiddenPageParams extends Record<string, string> {
  reason: string;
}

const ForbiddenPage: FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const params: Readonly<Partial<ForbiddenPageParams>> = useParams<ForbiddenPageParams>();
  const handleBackButtonClick = useCallback((): void => {
    appLogger.debug("Back button clicked.");
    navigate(-1);
  }, [navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
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
        <Typography variant="h4">Forbidden</Typography>
        {params.reason && (
          <Alert severity="error">
            <AlertTitle>Reason</AlertTitle>
            {humanize(params.reason.replaceAll("-", " "))}
          </Alert>
        )}
        <Button variant="contained" size="large" onClick={handleBackButtonClick} sx={{ marginTop: "2%" }}>
          Back
        </Button>
      </Paper>
    </Box>
  );
};

export default ForbiddenPage;
