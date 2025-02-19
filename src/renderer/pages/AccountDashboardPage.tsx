import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ISignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";

export interface IAccountDashboardPageParams extends Record<string, string> {
  username: string;
}

const AccountDashboardPage: FC = () => {
  const signedInDashboardLayoutRootContext: ISignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();
  const params: Readonly<Partial<IAccountDashboardPageParams>> = useParams<IAccountDashboardPageParams>();

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
      <Typography variant="h5">Account Dashboard for user: {params.username}</Typography>
    </Box>
  );
};

export default AccountDashboardPage;
