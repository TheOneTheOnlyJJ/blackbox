import Dialog, { DialogProps } from "@mui/material/Dialog/Dialog";
import { FC, Ref, useCallback, useRef } from "react";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import NewUserDataStorageConfigForm from "../forms/NewUserDataStorageConfigForm";
import Form from "@rjsf/core";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";

export interface INewUserDataStorageConfigFormDialogProps {
  userIdToAddTo: string;
  onAddedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const NewUserDataStorageConfigFormDialog: FC<INewUserDataStorageConfigFormDialogProps> = (props: INewUserDataStorageConfigFormDialogProps) => {
  const formRef: Ref<Form> = useRef<Form>(null);
  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("New User Data Storage Config form Submit button clicked.");
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
        <NewUserDataStorageConfigForm
          formRef={formRef}
          userIdToAddTo={props.userIdToAddTo}
          onAddedSuccessfully={props.onAddedSuccessfully}
          noRenderSubmitButton={true}
        />
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

export default NewUserDataStorageConfigFormDialog;
