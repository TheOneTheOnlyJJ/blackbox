import { Button, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import { appLogger } from "@renderer/utils/loggers";
import Form from "@rjsf/core";
import { RJSFValidationError } from "@rjsf/utils";
import { enqueueSnackbar } from "notistack";
import { FC, Ref, useCallback, useMemo, useRef, useState } from "react";
import NewUserDataTemplateForm from "../forms/NewUserDataTemplateForm";

export interface INewUserDataTemplateFormDialogProps {
  onAddedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const NewUserDataTemplateFormDialog: FC<INewUserDataTemplateFormDialogProps> = (props: INewUserDataTemplateFormDialogProps) => {
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isAddUserDataTemplatePending, setIsAddUserDataTemplatePending] = useState<boolean>(false);
  const [extraErrors, setExtraErrors] = useState<RJSFValidationError[]>([]);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return isAddUserDataTemplatePending; // TODO: Implement condition of open user data storage. Take storageId as prop?
  }, [isAddUserDataTemplatePending]);

  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("New User Data Template form Submit button clicked.");
    if (isAddUserDataTemplatePending) {
      appLogger.warn("Add User Data Template pending. No-op form sumit.");
      return;
    }
    setExtraErrors([]);
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid New User Data Template form data.");
      return;
    }
    appLogger.info("Schema valid New User Data Template form data. Submitting.");
    formRef.current.submit();
  }, [isAddUserDataTemplatePending]);

  const handleDialogClose = useCallback((): void => {
    setExtraErrors([]);
    props.onClose();
  }, [props]);

  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open} onClose={handleDialogClose}>
      <DialogContent>
        <NewUserDataTemplateForm
          formRef={formRef}
          onAddedSuccessfully={props.onAddedSuccessfully}
          renderSubmitButton={false}
          isAddUserDataTemplatePending={isAddUserDataTemplatePending}
          setIsAddUserDataTemplatePending={setIsAddUserDataTemplatePending}
          extraErrors={extraErrors}
          setExtraErrors={setExtraErrors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button variant="contained" disabled={isSubmitButtonDisabled} onClick={handleSubmitButtonClick}>
          {isAddUserDataTemplatePending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDataTemplateFormDialog;
