import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Typography } from "@mui/material";
import { FC } from "react";
import UserDataStorageConfigInfoTypography from "../../../../../../user/data/storage/config/info/UserDataStorageConfigInfoTypography";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";

export interface IUserDataStorageConfigInfoDialogProps {
  userDataStorageConfigInfo: IUserDataStorageConfigInfo;
  open: DialogProps["open"];
  onClose: () => void;
  doShowId: boolean;
}

const UserDataStorageConfigInfoDialog: FC<IUserDataStorageConfigInfoDialogProps> = (props: IUserDataStorageConfigInfoDialogProps) => {
  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open} onClose={props.onClose}>
      <DialogTitle>User data storage configuration information</DialogTitle>
      <DialogContent>
        <Typography sx={{ marginBottom: ".5rem" }}>
          Data storage configurations instruct BlackBox where and how to read and write your data.
        </Typography>
        <Alert severity="info">
          <AlertTitle>User data storage configuration:</AlertTitle>
          <UserDataStorageConfigInfoTypography userDataStorageConfigInfo={props.userDataStorageConfigInfo} doShowId={props.doShowId} />
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={props.onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDataStorageConfigInfoDialog;
