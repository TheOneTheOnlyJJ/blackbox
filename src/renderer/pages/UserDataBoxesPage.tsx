import { Box, Typography } from "@mui/material";
import {
  IDashboardLayoutRootContext,
  useDashboardLayoutRootContext
} from "@renderer/components/roots/dashboardLayoutRoot/DashboardLayoutRootContext";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { FC, useEffect } from "react";

const UserDataBoxesPage: FC = () => {
  const dashboardLayoutRootContext: IDashboardLayoutRootContext = useDashboardLayoutRootContext();

  useEffect((): void => {
    dashboardLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.boxes);
    // dashboardLayoutRootContext.setAppBarTitle("Boxes");
    dashboardLayoutRootContext.setForbiddenLocationName("Boxes");
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
        background: "grey99"
      }}
    >
      <Typography variant="h5">BOXES</Typography>
    </Box>
  );
};

export default UserDataBoxesPage;
