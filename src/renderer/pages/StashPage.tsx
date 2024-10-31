import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useCallback, useEffect } from "react";
import {
  SignedInDashboardLayoutRootContext,
  useSignedInDashboardLayoutRootContext
} from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRootContext";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";

const StashPage: FC = () => {
  const signedInDashboardLayoutRootContext: SignedInDashboardLayoutRootContext = useSignedInDashboardLayoutRootContext();
  const handleNewStashButtonClick = useCallback((): void => {
    appLogger.debug("New Stash button clicked.");
  }, []);

  useEffect(() => {
    signedInDashboardLayoutRootContext.setAppBarTitle("Stash");
    signedInDashboardLayoutRootContext.setForbiddenLocationName("Stash");
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
        background: "lime"
      }}
    >
      <Typography variant="h5">Stash</Typography>
      <Button variant="contained" size="large" onClick={handleNewStashButtonClick}>
        New Stash
      </Button>
    </Box>
  );
};

export default StashPage;
