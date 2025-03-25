import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  IDashboardLayoutRootContext,
  useDashboardLayoutRootContext
} from "@renderer/components/roots/dashboardLayoutRoot/DashboardLayoutRootContext";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { appLogger } from "@renderer/utils/loggers";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";

export interface IAccountDashboardPageParams extends Record<string, string> {
  userId: string;
}

const AccountDashboardPage: FC = () => {
  const dashboardLayoutRootContext: IDashboardLayoutRootContext = useDashboardLayoutRootContext();
  const params: Readonly<Partial<IAccountDashboardPageParams>> = useParams<IAccountDashboardPageParams>();
  const getUsernameForUserId = useCallback(
    (userId: string | undefined): string => {
      if (userId === undefined) {
        appLogger.warn("Undefined user ID!");
        return "Undefined user ID";
      }
      if (userId === dashboardLayoutRootContext.signedInUserInfo.userId) {
        appLogger.debug("User ID is signed in user's.");
        return dashboardLayoutRootContext.signedInUserInfo.username;
      }
      appLogger.debug("Getting username for user ID from main process.");
      const GET_USERNAME_FOR_USER_ID_RESPONSE: IPCAPIResponse<string | null> = window.userAccountAPI.getUsernameForUserId(userId);
      if (GET_USERNAME_FOR_USER_ID_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
        if (GET_USERNAME_FOR_USER_ID_RESPONSE.data === null) {
          return "Invalid user ID";
        }
        return GET_USERNAME_FOR_USER_ID_RESPONSE.data;
      }
      return "Error getting username";
    },
    [dashboardLayoutRootContext.signedInUserInfo]
  );

  useEffect((): void => {
    dashboardLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.dashboard);
    dashboardLayoutRootContext.setAppBarTitle("Dashboard");
    dashboardLayoutRootContext.setForbiddenLocationName("Dashboard");
  }, [dashboardLayoutRootContext]);

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
