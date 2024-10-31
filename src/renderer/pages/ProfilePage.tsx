import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useEffect } from "react";
import {
  SignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";

const ProfilePage: FC = () => {
  const signedInDashboardLayoutRootContext: SignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();

  useEffect(() => {
    signedInDashboardLayoutRootContext.setAppBarTitle("Profile");
    signedInDashboardLayoutRootContext.setForbiddenLocationName("Profile");
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
        background: "yellow"
      }}
    >
      <Typography variant="h5">Profile</Typography>
    </Box>
  );
};

export default ProfilePage;
