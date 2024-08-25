import { Alert, AlertTitle, Box, Button, DialogActions, DialogContent, Typography } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ordinalize } from "inflection";

export interface SuccessfulUserRegistrationDialogProps {
  open: boolean;
  username: string;
  userCount: number;
}

const SuccessfulUserRegistrationDialog: FC<SuccessfulUserRegistrationDialogProps> = (props: SuccessfulUserRegistrationDialogProps) => {
  const navigate = useNavigate();
  const handleDialogClose = useCallback(
    (_: object, reason: "backdropClick" | "escapeKeyDown") => {
      // This ensures backdrop clicks do not close the dialog
      if (reason === "backdropClick") {
        return;
      }
      navigate("/");
    },
    [navigate]
  );
  const handleButtonClose = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <Dialog maxWidth="xl" open={props.open} onClose={handleDialogClose}>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CheckCircleOutlineOutlinedIcon color="success" sx={{ fontSize: 100 }} />
          <Typography variant="h5" sx={{ marginBottom: "1vw" }}>
            Registration success
          </Typography>
          <Alert severity="success">
            <AlertTitle>Congratulations {props.username}!</AlertTitle>
            You are the {ordinalize(props.userCount.toString())} registered BlackBox user!
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "center"
        }}
      >
        <Button variant="contained" onClick={handleButtonClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessfulUserRegistrationDialog;
