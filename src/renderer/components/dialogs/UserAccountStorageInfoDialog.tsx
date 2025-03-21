import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle } from "@mui/material";
import { FC } from "react";
import { IAppRootContext, useAppRootContext } from "../roots/appRoot/AppRootContext";
import UserAccountStorageInfoTypography from "../user/account/storage/info/UserAccountStorageInfoTypography";

export interface UserAccountStorageInfoDialogProps {
  open: DialogProps["open"];
  onClose: () => void;
}

const UserAccountStorageInfoDialog: FC<UserAccountStorageInfoDialogProps> = (props: UserAccountStorageInfoDialogProps) => {
  const { userAccountStorageInfo }: IAppRootContext = useAppRootContext();
  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open}>
      <DialogTitle>User account storage information</DialogTitle>
      <DialogContent>
        {userAccountStorageInfo === null ? (
          <>
            <Alert severity="warning">
              <AlertTitle>No user account storage</AlertTitle>
              Cannot complete any operations involving the user account storage.
            </Alert>
          </>
        ) : (
          <Alert severity="info">
            <AlertTitle>The user account storage:</AlertTitle>
            <UserAccountStorageInfoTypography userAccountStorageInfo={userAccountStorageInfo} />
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
