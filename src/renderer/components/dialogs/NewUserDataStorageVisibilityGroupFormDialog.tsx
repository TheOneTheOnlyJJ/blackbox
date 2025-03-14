import { Button, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import { appLogger } from "@renderer/utils/loggers";
import Form from "@rjsf/core";
import { enqueueSnackbar } from "notistack";
import { FC, Ref, useCallback, useRef, useState } from "react";
import NewUserDataStorageVisibilityGroupForm from "../forms/NewUserDataStorageVisibilityGroupForm";

export interface INewUserDataStorageVisibilityGroupFormDialogProps {
  userIdToAddTo: string;
  onAddedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const NewUserDataStorageVisibilityGroupFormDialog: FC<INewUserDataStorageVisibilityGroupFormDialogProps> = (
  props: INewUserDataStorageVisibilityGroupFormDialogProps
) => {
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isAddUserDataStorageVisibilityGroupPending, setIsAddUserDataStorageVisibilityGroupPending] = useState<boolean>(false);

  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("New User Data Storage Visibility Group form Submit button clicked.");
    if (isAddUserDataStorageVisibilityGroupPending) {
      appLogger.warn("Add User Data Storage Visibility Group pending. No-op form sumit.");
      return;
    }
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid New User Data Storage Visibility Group form data.");
      return;
    }
    appLogger.info("Valid New User Data Storage Visibility Group form data. Submitting.");
    formRef.current.submit();
  }, [isAddUserDataStorageVisibilityGroupPending]);

  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open} onClose={props.onClose}>
      <DialogContent>
        <NewUserDataStorageVisibilityGroupForm
          formRef={formRef}
          userIdToAddTo={props.userIdToAddTo}
          onAddedSuccessfully={props.onAddedSuccessfully}
          renderSubmitButton={false}
          isAddUserDataStorageVisibilityGroupPending={isAddUserDataStorageVisibilityGroupPending}
          setIsAddUserDataStorageVisibilityGroupPending={setIsAddUserDataStorageVisibilityGroupPending}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button variant="contained" disabled={isAddUserDataStorageVisibilityGroupPending} onClick={handleSubmitButtonClick}>
          {isAddUserDataStorageVisibilityGroupPending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDataStorageVisibilityGroupFormDialog;
