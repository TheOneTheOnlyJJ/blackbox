import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useEffect } from "react";
import {
  IDashboardLayoutRootContext,
  useDashboardLayoutRootContext
} from "@renderer/components/roots/dashboardLayoutRoot/DashboardLayoutRootContext";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";

const SettingsPage: FC = () => {
  const dashboardLayoutRootContext: IDashboardLayoutRootContext = useDashboardLayoutRootContext();

  useEffect((): void => {
    dashboardLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.settings);
    dashboardLayoutRootContext.setAppBarTitle("Settings");
    dashboardLayoutRootContext.setForbiddenLocationName("Settings");
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
        background: "blue"
      }}
    >
      <Typography variant="h5">Settings</Typography>
    </Box>
  );
};

export default SettingsPage;
