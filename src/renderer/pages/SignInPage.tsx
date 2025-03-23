import { Link } from "react-router-dom";
import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import Paper from "@mui/material/Paper/Paper";
import { FC, useCallback, useState } from "react";
import UserSignInForm from "@renderer/components/forms/UserSignInForm";
import { IconButton, Stack, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import UserAccountStorageInfoDialog from "@renderer/components/dialogs/UserAccountStorageInfoDialog";
import { appLogger } from "@renderer/utils/loggers";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";

const SignInPage: FC = () => {
  const [isSignInPending, setIsSignInPending] = useState<boolean>(false);
  const [isUserAccountStorageInfoDialogOpen, setIsUserAccountStorageInfoDialogOpen] = useDialogOpenState(appLogger, "User Account Storage info");

  const handleUserAccountStorageInfoButtonClick = useCallback((): void => {
    appLogger.debug("User Account Storage info button clicked.");
    setIsUserAccountStorageInfoDialogOpen(true);
  }, [setIsUserAccountStorageInfoDialogOpen]);

  const handleUserAccountStorageInfoDialogClose = useCallback((): void => {
    setIsUserAccountStorageInfoDialogOpen(false);
  }, [setIsUserAccountStorageInfoDialogOpen]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(-45deg, #FFC796 0%, #FF6B95 100%)`
        }}
      >
        <Paper
          elevation={24}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            minWidth: "40%",
            maxHeight: "80%",
            padding: "1em",
            overflow: "auto"
          }}
        >
          <Typography variant="h4">Sign in</Typography>
          <UserSignInForm isSignInPending={isSignInPending} setIsSignInPending={setIsSignInPending} renderSubmitButton={true} />
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Typography>
              New to BlackBox?{" "}
              <Link to="/signup" replace={true}>
                Sign up
              </Link>
            </Typography>
            <Tooltip title="User account storage information" arrow>
              <IconButton onClick={handleUserAccountStorageInfoButtonClick}>
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>
      </Box>
      <UserAccountStorageInfoDialog open={isUserAccountStorageInfoDialogOpen} onClose={handleUserAccountStorageInfoDialogClose} doShowId={true} />
    </>
  );
};

export default SignInPage;
