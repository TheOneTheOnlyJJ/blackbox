import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useEffect } from "react";
import {
  SignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "../components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";

const StashPage: FC = () => {
  const signedInDashboardLayoutRootContext: SignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();

  useEffect(() => {
    signedInDashboardLayoutRootContext.setAppBarTitle("Stash");
    signedInDashboardLayoutRootContext.setForbiddenLocationName("Stash");
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
        background: "lime"
      }}
    >
      <Typography variant="h5">Stash</Typography>
    </Box>
  );
};

export default StashPage;
