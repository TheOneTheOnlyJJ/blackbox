import { Box, Button, Stack, Typography } from "@mui/material";
import AvailableUserDataBoxesDataGrid from "@renderer/components/dataGrids/AvailableUserDataBoxesDataGrid";
import {
  IUserDataBoxesNavigationAreaLayoutRootContext,
  useUserDataBoxesNavigationAreaLayoutRootContext
} from "@renderer/components/roots/userDataBoxesNavigationAreaLayoutRoot/UserDataBoxesNavigationAreaLayoutRootContext";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { USER_DATA_BOXES_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataBoxesNavigationAreas";
import { FC, useCallback, useEffect } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import NewUserDataBoxConfigFormDialog from "@renderer/components/dialogs/NewUserDataBoxConfigFormDialog";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";
import { appLogger } from "@renderer/utils/loggers";

const AvailableUserDataBoxesPage: FC = () => {
  const userDataBoxesNavigationAreaLayoutRootContext: IUserDataBoxesNavigationAreaLayoutRootContext =
    useUserDataBoxesNavigationAreaLayoutRootContext();
  const [isNewUserDataBoxConfigFormDialogOpen, setIsNewUserDataBoxConfigFormDialogOpen] = useDialogOpenState(
    appLogger,
    "new User Data Box Config form"
  );

  const handleNewDataBoxButtonClick = useCallback((): void => {
    appLogger.debug("New User Data Box Config button clicked.");
    setIsNewUserDataBoxConfigFormDialogOpen(true);
  }, [setIsNewUserDataBoxConfigFormDialogOpen]);

  const handleNewUserDataBoxConfigFormDialogClose = useCallback((): void => {
    setIsNewUserDataBoxConfigFormDialogOpen(false);
  }, [setIsNewUserDataBoxConfigFormDialogOpen]);

  const handleSuccessfullyAddedNewUserDataBoxConfig = useCallback((): void => {
    handleNewUserDataBoxConfigFormDialogClose();
  }, [handleNewUserDataBoxConfigFormDialogClose]);

  useEffect((): void => {
    userDataBoxesNavigationAreaLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.boxes);
    userDataBoxesNavigationAreaLayoutRootContext.setUserDataBoxesNavigationArea(USER_DATA_BOXES_NAVIGATION_AREAS.availableBoxes);
    userDataBoxesNavigationAreaLayoutRootContext.setForbiddenLocationName("Available Boxes");
  }, [userDataBoxesNavigationAreaLayoutRootContext]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%"
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button variant="contained" size="large" startIcon={<AddOutlinedIcon />} onClick={handleNewDataBoxButtonClick}>
            New box
          </Button>
        </Stack>
        <Typography variant="h5" sx={{ marginTop: ".5rem" }}>
          Available boxes:
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem" }}>
          <AvailableUserDataBoxesDataGrid />
        </Box>
      </Box>
      <NewUserDataBoxConfigFormDialog
        defaultValues={null}
        onAddedSuccessfully={handleSuccessfullyAddedNewUserDataBoxConfig}
        open={isNewUserDataBoxConfigFormDialogOpen}
        onClose={handleNewUserDataBoxConfigFormDialogClose}
      />
    </>
  );
};

export default AvailableUserDataBoxesPage;
