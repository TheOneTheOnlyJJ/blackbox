import { Button, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import Form from "@rjsf/core";
import { FC, Ref, useCallback, useMemo, useRef, useState } from "react";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";
import { RJSFValidationError } from "@rjsf/utils";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import NewUserDataEntryForm from "@renderer/components/forms/user/data/entry/NewUserDataEntryForm";

export interface INewUserDataEntryFormDialogProps {
  templateInfo: IUserDataTemplateInfo;
  onAddedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const NewUserDataEntryFormDialog: FC<INewUserDataEntryFormDialogProps> = (props: INewUserDataEntryFormDialogProps) => {
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isAddUserDataEntryPending, setIsAddUserDataEntryPending] = useState<boolean>(false);
  const [extraErrors, setExtraErrors] = useState<RJSFValidationError[]>([]);
  // TODO: Delete this
  // const errorSchemaBuilder = useMemo<ErrorSchemaBuilder>((): ErrorSchemaBuilder => {
  //   return new ErrorSchemaBuilder();
  // }, []);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return isAddUserDataEntryPending; // TODO: Implement condition of open user data storage. Take storageId as prop?
  }, [isAddUserDataEntryPending]);

  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("New User Data Entry form Submit button clicked.");
    if (isAddUserDataEntryPending) {
      appLogger.warn("Add User Data Entry pending. No-op form sumit.");
      return;
    }
    // errorSchemaBuilder.resetAllErrors();
    setExtraErrors([]);
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid New User Data Entry form data.");
      return;
    }
    appLogger.info("Schema valid New User Data Entry form data. Submitting.");
    formRef.current.submit();
  }, [isAddUserDataEntryPending]);

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
        <NewUserDataEntryForm
          formRef={formRef}
          templateInfo={props.templateInfo}
          onAddedSuccessfully={props.onAddedSuccessfully}
          renderSubmitButton={false}
          isAddUserDataEntryPending={isAddUserDataEntryPending}
          setIsAddUserDataEntryPending={setIsAddUserDataEntryPending}
          // errorSchemaBuilder={errorSchemaBuilder}
          extraErrors={extraErrors}
          setExtraErrors={setExtraErrors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button variant="contained" disabled={isSubmitButtonDisabled} onClick={handleSubmitButtonClick}>
          {isAddUserDataEntryPending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDataEntryFormDialog;
