import { Box, Typography } from "@mui/material";
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
        justifyContent: "start",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "grey99"
      }}
    >
      <Typography variant="h5">Available Boxes...</Typography>
    </Box>
  );
};

export default AvailableUserDataBoxesPage;
