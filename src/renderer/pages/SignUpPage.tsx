import { FC, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box/Box";
import Paper from "@mui/material/Paper/Paper";
import Typography from "@mui/material/Typography/Typography";
import UserSignUpForm from "@renderer/components/forms/UserSignUpForm";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";
import { appLogger } from "@renderer/utils/loggers";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import UserAccountStorageInfoDialog from "@renderer/components/dialogs/UserAccountStorageInfoDialog";
import { IconButton, Stack, Tooltip } from "@mui/material";

const SignUpPage: FC = () => {
  const [isSignUpPending, setIsSignUpPending] = useState<boolean>(false);

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
          backgroundImage: "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);"
        }}
      >
        <Paper
          elevation={24}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            minWidth: "80%",
            maxHeight: "80%",
            padding: "1em",
            overflow: "auto"
          }}
        >
          <Typography variant="h4">Sign up</Typography>
          <UserSignUpForm isSignUpPending={isSignUpPending} setIsSignUpPending={setIsSignUpPending} renderSubmitButton={true} />
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/" replace={true}>
              Back to Sign in
            </Link>
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

export default SignUpPage;
