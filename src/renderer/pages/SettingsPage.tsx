import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useEffect } from "react";
import {
  ISignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";

const SettingsPage: FC = () => {
  const signedInDashboardLayoutRootContext: ISignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();

  useEffect((): void => {
    signedInDashboardLayoutRootContext.setAppBarTitle("Settings");
    signedInDashboardLayoutRootContext.setForbiddenLocationName("Settings");
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
        background: "blue"
      }}
    >
      <Typography variant="h5">Settings</Typography>
    </Box>
  );
};

export default SettingsPage;
