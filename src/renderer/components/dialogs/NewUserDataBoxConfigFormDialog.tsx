import { Button, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import Form from "@rjsf/core";
import { FC, Ref, useCallback, useMemo, useRef, useState } from "react";
import NewUserDataBoxConfigForm from "../forms/NewUserDataBoxConfigForm";
import { appLogger } from "@renderer/utils/loggers";
import { IUserDataBoxConfigCreateInput } from "@renderer/user/data/box/config/create/input/UserDataBoxConfigCreateInput";
import { enqueueSnackbar } from "notistack";

export interface INewUserDataBoxConfigFormDialogProps {
  defaultValues: Partial<IUserDataBoxConfigCreateInput> | null;
  onAddedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const NewUserDataBoxConfigFormDialog: FC<INewUserDataBoxConfigFormDialogProps> = (props: INewUserDataBoxConfigFormDialogProps) => {
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isAddUserDataBoxConfigPending, setIsAddUserDataBoxConfigPending] = useState<boolean>(false);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return isAddUserDataBoxConfigPending; // TODO: Implement condition of open user data storage. Take storageId as prop?
  }, [isAddUserDataBoxConfigPending]);

  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("New User Data Box Config form Submit button clicked.");
    if (isAddUserDataBoxConfigPending) {
      appLogger.warn("Add User Data Box Config pending. No-op form sumit.");
      return;
    }
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid New User Data Box Config form data.");
      return;
    }
    appLogger.info("Valid New User Data Box Config form data. Submitting.");
    formRef.current.submit();
  }, [isAddUserDataBoxConfigPending]);

  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open} onClose={props.onClose}>
      <DialogContent>
        <NewUserDataBoxConfigForm
          formRef={formRef}
          defaultValues={props.defaultValues}
          onAddedSuccessfully={props.onAddedSuccessfully}
          renderSubmitButton={false}
          isAddUserDataBoxConfigPending={isAddUserDataBoxConfigPending}
          setIsAddUserDataBoxConfigPending={setIsAddUserDataBoxConfigPending}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button variant="contained" disabled={isSubmitButtonDisabled} onClick={handleSubmitButtonClick}>
          {isAddUserDataBoxConfigPending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDataBoxConfigFormDialog;
