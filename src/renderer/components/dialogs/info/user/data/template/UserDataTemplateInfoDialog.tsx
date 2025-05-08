import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Typography } from "@mui/material";
import UserDataTemplateInfoTypography from "@renderer/components/user/data/template/info/UserDataTemplateInfoTypography";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { FC } from "react";

export interface IUserDataTemplateInfoDialogProps {
  userDataTemplateInfo: IUserDataTemplateInfo;
  open: DialogProps["open"];
  onClose: () => void;
  doShowId: boolean;
}

const UserDataTemplateInfoDialog: FC<IUserDataTemplateInfoDialogProps> = (props: IUserDataTemplateInfoDialogProps) => {
  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open}>
      <DialogTitle>User data template information</DialogTitle>
      <DialogContent>
        <Typography sx={{ marginBottom: ".5rem" }}>Data templates define the shape of your data.</Typography>
        <Alert severity="info">
          <AlertTitle>User data template:</AlertTitle>
          <UserDataTemplateInfoTypography
            userDataTemplateInfo={props.userDataTemplateInfo}
            doShowId={props.doShowId}
            doDisplayNullFieldProperties={false} // TODO: Make this configurable
          />
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

export default UserDataTemplateInfoDialog;
