import { Button, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import Form from "@rjsf/core";
import { FC, Ref, useCallback, useMemo, useRef, useState } from "react";
import NewUserDataBoxConfigForm from "../../../../../forms/user/data/box/NewUserDataBoxConfigForm";
import { appLogger } from "@renderer/utils/loggers";
import { IUserDataBoxConfigCreateInput } from "@renderer/user/data/box/config/create/input/UserDataBoxConfigCreateInput";
import { enqueueSnackbar } from "notistack";
import { RJSFValidationError } from "@rjsf/utils";

export interface INewUserDataBoxConfigFormDialogProps {
  defaultValues: Partial<IUserDataBoxConfigCreateInput> | null;
  onAddedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const NewUserDataBoxConfigFormDialog: FC<INewUserDataBoxConfigFormDialogProps> = (props: INewUserDataBoxConfigFormDialogProps) => {
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isAddUserDataBoxConfigPending, setIsAddUserDataBoxConfigPending] = useState<boolean>(false);
  const [extraErrors, setExtraErrors] = useState<RJSFValidationError[]>([]);
  // const errorSchemaBuilder = useMemo<ErrorSchemaBuilder>((): ErrorSchemaBuilder => {
  //   return new ErrorSchemaBuilder();
  // }, []);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return isAddUserDataBoxConfigPending; // TODO: Implement condition of open user data storage. Take storageId as prop?
  }, [isAddUserDataBoxConfigPending]);

  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("New User Data Box Config form Submit button clicked.");
    if (isAddUserDataBoxConfigPending) {
      appLogger.warn("Add User Data Box Config pending. No-op form sumit.");
      return;
    }
    // errorSchemaBuilder.resetAllErrors();
    setExtraErrors([]);
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid New User Data Box Config form data.");
      return;
    }
    appLogger.info("Schema valid New User Data Box Config form data. Submitting.");
    formRef.current.submit();
  }, [isAddUserDataBoxConfigPending]);

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
        <NewUserDataBoxConfigForm
          formRef={formRef}
          defaultValues={props.defaultValues}
          onAddedSuccessfully={props.onAddedSuccessfully}
          renderSubmitButton={false}
          isAddUserDataBoxConfigPending={isAddUserDataBoxConfigPending}
          setIsAddUserDataBoxConfigPending={setIsAddUserDataBoxConfigPending}
          // errorSchemaBuilder={errorSchemaBuilder}
          extraErrors={extraErrors}
          setExtraErrors={setExtraErrors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button variant="contained" disabled={isSubmitButtonDisabled} onClick={handleSubmitButtonClick}>
          {isAddUserDataBoxConfigPending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDataBoxConfigFormDialog;
