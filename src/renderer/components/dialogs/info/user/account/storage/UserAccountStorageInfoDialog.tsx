import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Typography } from "@mui/material";
import { FC } from "react";
import { IAppRootContext, useAppRootContext } from "../../../../../roots/appRoot/AppRootContext";
import UserAccountStorageInfoTypography from "../../../../../user/account/storage/info/UserAccountStorageInfoTypography";

export interface IUserAccountStorageInfoDialogProps {
  open: DialogProps["open"];
  onClose: () => void;
  doShowId: boolean;
}

const UserAccountStorageInfoDialog: FC<IUserAccountStorageInfoDialogProps> = (props: IUserAccountStorageInfoDialogProps) => {
  const { userAccountStorageInfo }: IAppRootContext = useAppRootContext();
  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open} onClose={props.onClose}>
      <DialogTitle>User account storage information</DialogTitle>
      <DialogContent>
        <Typography sx={{ marginBottom: ".5rem" }}>
          Account credentials, data storage configurations and visibility groups are saved in the user account storage.
        </Typography>
        {userAccountStorageInfo === null ? (
          <>
            <Alert severity="warning">
              <AlertTitle>No currently set user account storage</AlertTitle>
              Cannot complete any operations involving the user account storage.
            </Alert>
          </>
        ) : (
          <Alert severity="info">
            <AlertTitle>Currently set user account storage:</AlertTitle>
            <UserAccountStorageInfoTypography userAccountStorageInfo={userAccountStorageInfo} doShowId={props.doShowId} />
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={props.onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserAccountStorageInfoDialog;
