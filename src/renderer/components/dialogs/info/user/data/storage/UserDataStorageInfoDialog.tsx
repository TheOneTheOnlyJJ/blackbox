import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Typography } from "@mui/material";
import { FC } from "react";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import UserDataStorageInfoTypography from "../../../../../user/data/storage/info/UserDataStorageInfoTypography";

export interface IUserDataStorageInfoDialogProps {
  userDataStorageInfo: IUserDataStorageInfo;
  open: DialogProps["open"];
  onClose: () => void;
  doShowId: boolean;
}

const UserDataStorageInfoDialog: FC<IUserDataStorageInfoDialogProps> = (props: IUserDataStorageInfoDialogProps) => {
  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open} onClose={props.onClose}>
      <DialogTitle>User data storage information</DialogTitle>
      <DialogContent>
        <Typography sx={{ marginBottom: ".5rem" }}>Data storages host your data.</Typography>
        <Alert severity="info">
          <AlertTitle>User data storage:</AlertTitle>
          <UserDataStorageInfoTypography userDataStorageInfo={props.userDataStorageInfo} doShowId={props.doShowId} />
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

export default UserDataStorageInfoDialog;
