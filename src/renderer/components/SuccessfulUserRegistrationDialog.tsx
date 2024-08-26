import Dialog from "@mui/material/Dialog/Dialog";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ordinalize } from "inflection";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import Button from "@mui/material/Button/Button";

export interface SuccessfulUserRegistrationDialogProps {
  open: boolean;
  username: string;
  userCount: number;
}

const SuccessfulUserRegistrationDialog: FC<SuccessfulUserRegistrationDialogProps> = (props: SuccessfulUserRegistrationDialogProps) => {
  const navigate = useNavigate();
  const handleDialogClose = useCallback((): void => {
    // This ensures no backdrop click or escape keypress closes the dialog
    return;
  }, []);
  const handleButtonClose = useCallback((): void => {
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
            Registration successful
          </Typography>
          <Alert severity="success">
            <AlertTitle>Congratulations {props.username}!</AlertTitle>
            You&apos;re the {ordinalize(props.userCount.toString())} registered BlackBox user!
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
