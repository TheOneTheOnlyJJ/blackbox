import { Button, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import { appLogger } from "@renderer/utils/loggers";
import Form from "@rjsf/core";
import { RJSFValidationError } from "@rjsf/utils";
import { enqueueSnackbar } from "notistack";
import { FC, Ref, useCallback, useMemo, useRef, useState } from "react";
import NewUserDataTemplateConfigForm from "../../../../../forms/user/data/template/NewUserDataTemplateConfigForm";

export interface INewUserDataTemplateConfigFormDialogProps {
  onAddedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const NewUserDataTemplateConfigFormDialog: FC<INewUserDataTemplateConfigFormDialogProps> = (props: INewUserDataTemplateConfigFormDialogProps) => {
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isAddUserDataTemplateConfigPending, setIsAddUserDataTemplateConfigPending] = useState<boolean>(false);
  const [extraErrors, setExtraErrors] = useState<RJSFValidationError[]>([]);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return isAddUserDataTemplateConfigPending; // TODO: Implement condition of open user data storage. Take storageId as prop?
  }, [isAddUserDataTemplateConfigPending]);

  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("New User Data Template Config form Submit button clicked.");
    if (isAddUserDataTemplateConfigPending) {
      appLogger.warn("Add User Data Template Config pending. No-op form sumit.");
      return;
    }
    setExtraErrors([]);
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid New User Data Template Config form data.");
      return;
    }
    appLogger.info("Schema valid New User Data Template Config form data. Submitting.");
    formRef.current.submit();
  }, [isAddUserDataTemplateConfigPending]);

  const handleDialogClose = useCallback((): void => {
    setExtraErrors([]);
    props.onClose();
  }, [props]);

  const handleDialogCloseWithReason = useCallback(
    (_: object, reason?: "backdropClick" | "escapeKeyDown"): void => {
      if (reason !== undefined && reason === "backdropClick") {
        return;
      }
      handleDialogClose();
    },
    [handleDialogClose]
  );

  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open} onClose={handleDialogCloseWithReason}>
      <DialogContent>
        <NewUserDataTemplateConfigForm
          formRef={formRef}
          onAddedSuccessfully={props.onAddedSuccessfully}
          renderSubmitButton={false}
          isAddUserDataTemplateConfigPending={isAddUserDataTemplateConfigPending}
          setIsAddUserDataTemplateConfigPending={setIsAddUserDataTemplateConfigPending}
          extraErrors={extraErrors}
          setExtraErrors={setExtraErrors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button variant="contained" disabled={isSubmitButtonDisabled} onClick={handleSubmitButtonClick}>
          {isAddUserDataTemplateConfigPending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDataTemplateConfigFormDialog;
