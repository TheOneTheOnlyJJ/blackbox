import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ISignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { appLogger } from "@renderer/utils/loggers";

export interface IAccountDashboardPageParams extends Record<string, string> {
  userId: string;
}

const AccountDashboardPage: FC = () => {
  const signedInDashboardLayoutRootContext: ISignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();
  const params: Readonly<Partial<IAccountDashboardPageParams>> = useParams<IAccountDashboardPageParams>();
  const getUsernameForUserId = useCallback(
    (userId: string | undefined): string => {
      if (userId === undefined) {
        appLogger.warn("Undefined user ID!");
        return "Undefined user ID";
      }
      if (userId === signedInDashboardLayoutRootContext.signedInUser.userId) {
        appLogger.debug("User ID is signed in user's.");
        return signedInDashboardLayoutRootContext.signedInUser.username;
      }
      appLogger.debug("Getting username for user ID from main process.");
      const GET_USERNAME_FOR_USER_ID_RESPONSE: IPCAPIResponse<string | null> = window.userAPI.getUsernameForUserId(userId);
      if (GET_USERNAME_FOR_USER_ID_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
        if (GET_USERNAME_FOR_USER_ID_RESPONSE.data === null) {
          return "Invalid user ID";
        }
        return GET_USERNAME_FOR_USER_ID_RESPONSE.data;
      }
      return "Error getting username";
    },
    [signedInDashboardLayoutRootContext.signedInUser]
  );

  useEffect((): void => {
    signedInDashboardLayoutRootContext.setAppBarTitle("Dashboard");
    signedInDashboardLayoutRootContext.setForbiddenLocationName("Dashboard");
  }, [signedInDashboardLayoutRootContext]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "pink"
      }}
    >
      <Typography variant="h5">Account Dashboard for user: {getUsernameForUserId(params.userId)}</Typography>
    </Box>
  );
};

export default AccountDashboardPage;
