import { Box, Typography } from "@mui/material";
import AvailableUserDataBoxesDataGrid from "@renderer/components/dataGrids/AvailableUserDataBoxesDataGrid";
import {
  IUserDataBoxesNavigationAreaLayoutRootContext,
  useUserDataBoxesNavigationAreaLayoutRootContext
} from "@renderer/components/roots/userDataBoxesNavigationAreaLayoutRoot/UserDataBoxesNavigationAreaLayoutRootContext";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { USER_DATA_BOXES_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataBoxesNavigationAreas";
import { FC, useEffect } from "react";

const AvailableUserDataBoxesPage: FC = () => {
  const userDataBoxesNavigationAreaLayoutRootContext: IUserDataBoxesNavigationAreaLayoutRootContext =
    useUserDataBoxesNavigationAreaLayoutRootContext();

  useEffect((): void => {
    userDataBoxesNavigationAreaLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.boxes);
    userDataBoxesNavigationAreaLayoutRootContext.setUserDataBoxesNavigationArea(USER_DATA_BOXES_NAVIGATION_AREAS.availableBoxes);
    userDataBoxesNavigationAreaLayoutRootContext.setForbiddenLocationName("Available Boxes");
  }, [userDataBoxesNavigationAreaLayoutRootContext]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%"
      }}
    >
      <Typography variant="h5">Available boxes:</Typography>
      <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem" }}>
        <AvailableUserDataBoxesDataGrid />
      </Box>
    </Box>
  );
};

export default AvailableUserDataBoxesPage;
