import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  SignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";

export interface AccountDashboardPageParams extends Record<string, string> {
  username: string;
}

const AccountDashboardPage: FC = () => {
  const signedInDashboardLayoutRootContext: SignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();
  const params: Readonly<Partial<AccountDashboardPageParams>> = useParams<AccountDashboardPageParams>();

  useEffect(() => {
    signedInDashboardLayoutRootContext.setAppBarTitle("Dashboard");
    signedInDashboardLayoutRootContext.setForbiddenLocationName("Dashboard");
  }, []);

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
      <Typography variant="h5">Account Dashboard for user: {params.username}</Typography>
    </Box>
  );
};

export default AccountDashboardPage;
