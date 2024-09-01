import Box from "@mui/material/Box/Box";
import Button from "@mui/material/Button/Button";
import Typography from "@mui/material/Typography/Typography";
import { FC, useCallback } from "react";
import { appLogger } from "../utils/loggers";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { AppRootContext, useAppRootContext } from "../appRoot/AppRootContext";
import { IPCAPIResponse } from "../../shared/IPC/IPCAPIResponse";
import { IPCAPIResponseStatus } from "../../shared/IPC/IPCAPIResponseStatus";

export interface AccountDashboardPageParams extends Record<string, string> {
  userId: string;
}

const AccountDashboardPage: FC = () => {
  const appRootContext: AppRootContext = useAppRootContext();
  const navigate: NavigateFunction = useNavigate();
  const params: Readonly<Partial<AccountDashboardPageParams>> = useParams<AccountDashboardPageParams>();
  const handleSignOutButtonClick = useCallback((): void => {
    appLogger.debug("Sign out button clicked!");
    const SIGN_OUT_RESPONSE: IPCAPIResponse = window.userAPI.signOut();
    if (SIGN_OUT_RESPONSE.status !== IPCAPIResponseStatus.SUCCESS) {
      // TODO: RIASE ERROR DIALOG
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        flexDirection: "column",
        width: "100vw",
        height: "100vh"
      }}
    >
      <Typography variant="h5">
        Account Dashboard for user: {appRootContext.currentlySignedInUser?.username} with ID {params.userId}
      </Typography>
      <Button onClick={handleSignOutButtonClick}>Sign Out</Button>
    </Box>
  );
};

export default AccountDashboardPage;
