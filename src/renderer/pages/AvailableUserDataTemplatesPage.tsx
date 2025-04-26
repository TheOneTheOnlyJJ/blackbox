import Box from "@mui/material/Box/Box";
import { FC, useCallback, useEffect } from "react";
import { DASHBOARD_NAVIGATION_AREAS } from "@renderer/navigationAreas/DashboardNavigationAreas";
import {
  IUserDataBoxesNavigationAreaLayoutRootContext,
  useUserDataBoxesNavigationAreaLayoutRootContext
} from "@renderer/components/roots/userDataBoxesNavigationAreaLayoutRoot/UserDataBoxesNavigationAreaLayoutRootContext";
import { USER_DATA_BOXES_NAVIGATION_AREAS } from "@renderer/navigationAreas/UserDataBoxesNavigationAreas";
import { Button, Stack, Typography } from "@mui/material";
import { appLogger } from "@renderer/utils/loggers";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";
import NewUserDataTemplateConfigFormDialog from "@renderer/components/dialogs/forms/user/data/template/NewUserDataTemplateConfigFormDialog";
import AvailableUserDataTemplatesDataGrid from "@renderer/components/dataGrids/AvailableUserDataTemplatesDataGrid";

const AvailableUserDataTemplatesPage: FC = () => {
  const userDataBoxesNavigationAreaLayoutRootContext: IUserDataBoxesNavigationAreaLayoutRootContext =
    useUserDataBoxesNavigationAreaLayoutRootContext();
  const [isNewUserDataTemplateFormDialogOpen, setIsNewUserDataTemplateFormDialogOpen] = useDialogOpenState(appLogger, "new User Data Template form");

  const handleNewDataTemplateButtonClick = useCallback((): void => {
    appLogger.debug("New User Data Template button clicked.");
    setIsNewUserDataTemplateFormDialogOpen(true);
  }, [setIsNewUserDataTemplateFormDialogOpen]);

  const handleNewUserDataTemplateFormDialogClose = useCallback((): void => {
    setIsNewUserDataTemplateFormDialogOpen(false);
  }, [setIsNewUserDataTemplateFormDialogOpen]);

  const handleSuccessfullyAddedNewUserDataTemplate = useCallback((): void => {
    handleNewUserDataTemplateFormDialogClose();
  }, [handleNewUserDataTemplateFormDialogClose]);

  useEffect((): void => {
    userDataBoxesNavigationAreaLayoutRootContext.setDashboardNavigationArea(DASHBOARD_NAVIGATION_AREAS.boxes);
    userDataBoxesNavigationAreaLayoutRootContext.setUserDataBoxesNavigationArea(USER_DATA_BOXES_NAVIGATION_AREAS.availableTemplates);
    userDataBoxesNavigationAreaLayoutRootContext.setForbiddenLocationName("Available Templates");
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
          <Button variant="contained" size="large" startIcon={<AddOutlinedIcon />} onClick={handleNewDataTemplateButtonClick}>
            New template
          </Button>
        </Stack>
        <Typography variant="h5" sx={{ marginTop: ".5rem" }}>
          Available templates:
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0, marginTop: ".5rem" }}>
          <AvailableUserDataTemplatesDataGrid />
        </Box>
      </Box>
      <NewUserDataTemplateConfigFormDialog
        onAddedSuccessfully={handleSuccessfullyAddedNewUserDataTemplate}
        open={isNewUserDataTemplateFormDialogOpen}
        onClose={handleNewUserDataTemplateFormDialogClose}
      />
    </>
  );
};

export default AvailableUserDataTemplatesPage;
