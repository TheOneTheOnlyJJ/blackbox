import Dialog, { DialogProps } from "@mui/material/Dialog/Dialog";
import { FC, Ref, useCallback, useRef } from "react";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import UserDataStorageConfigForm from "../forms/UserDataStorageConfigForm";
import Form, { FormProps } from "@rjsf/core";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";
import { IUserDataStorageConfigWithMetadataInputData } from "@shared/user/data/storage/inputData/UserDataStorageConfigWithMetadataInputData";

export interface IUserDataStorageConfigFormDialogProps {
  open: DialogProps["open"];
  handleFormSubmit: FormProps<IUserDataStorageConfigWithMetadataInputData>["onSubmit"];
  onClose: () => void;
}

const UserDataStorageConfigFormDialog: FC<IUserDataStorageConfigFormDialogProps> = (props: IUserDataStorageConfigFormDialogProps) => {
  const formRef: Ref<Form> = useRef<Form>(null);
  const handleSubmitButtonClick = useCallback((): void => {
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid User Data Storage Config form data.");
      return;
    }
    appLogger.info("Valid User Data Storage Config form data. Submitting.");
    formRef.current.submit();
  }, []);

  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open} onClose={props.onClose}>
      <DialogContent>
        <UserDataStorageConfigForm formRef={formRef} handleFormSubmit={props.handleFormSubmit} doRenderSubmitButton={false} />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmitButtonClick}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDataStorageConfigFormDialog;
