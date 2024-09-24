import Box from "@mui/material/Box/Box";
import Button from "@mui/material/Button/Button";
import Typography from "@mui/material/Typography/Typography";
import { FC, useCallback, useEffect } from "react";
import { appLogger } from "../utils/loggers";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { SignedInRootContext, useSignedInRootContext } from "../components/roots/signedInRoot/SignedInRootContext";

export interface AccountDashboardPageParams extends Record<string, string> {
  userId: string;
}

const AccountDashboardPage: FC = () => {
  const signedInRootContext: SignedInRootContext = useSignedInRootContext();
  const navigate: NavigateFunction = useNavigate();
  const params: Readonly<Partial<AccountDashboardPageParams>> = useParams<AccountDashboardPageParams>();
  const handleSignOutButtonClick = useCallback((): void => {
    appLogger.debug("Sign out button clicked.");
    navigate("/signing-out");
  }, [navigate]);

  useEffect(() => {
    signedInRootContext.setAppBarTitle("Dashboard");
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
      <Typography variant="h5">
        Account Dashboard for user: {signedInRootContext.currentlySignedInUser.username} with ID: {params.userId}
      </Typography>
      <Button onClick={handleSignOutButtonClick}>Sign Out</Button>
    </Box>
  );
};

export default AccountDashboardPage;
