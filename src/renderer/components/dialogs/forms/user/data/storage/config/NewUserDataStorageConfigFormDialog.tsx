import Dialog, { DialogProps } from "@mui/material/Dialog/Dialog";
import { FC, Ref, useCallback, useMemo, useRef, useState } from "react";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import NewUserDataStorageConfigForm from "../../../../../../forms/user/data/storage/config/NewUserDataStorageConfigForm";
import Form from "@rjsf/core";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";
import { IAppRootContext, useAppRootContext } from "../../../../../../roots/appRoot/AppRootContext";
import { RJSFValidationError } from "@rjsf/utils";

export interface INewUserDataStorageConfigFormDialogProps {
  userIdToAddTo: string;
  onAddedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const NewUserDataStorageConfigFormDialog: FC<INewUserDataStorageConfigFormDialogProps> = (props: INewUserDataStorageConfigFormDialogProps) => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isAddUserDataStorageConfigPending, setIsAddUserDataStorageConfigPending] = useState<boolean>(false);
  const [extraErrors, setExtraErrors] = useState<RJSFValidationError[]>([]);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return isAddUserDataStorageConfigPending || appRootContext.userAccountStorageInfo === null
      ? true
      : !appRootContext.userAccountStorageInfo.backend.isOpen;
  }, [isAddUserDataStorageConfigPending, appRootContext.userAccountStorageInfo]);

  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("New User Data Storage Config form Submit button clicked.");
    if (isAddUserDataStorageConfigPending) {
      appLogger.warn("Add User Data Storage Config pending. No-op form sumit.");
      return;
    }
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid New User Data Storage Config form data.");
      return;
    }
    appLogger.info("Schema valid New User Data Storage Config form data. Submitting.");
    formRef.current.submit();
  }, [isAddUserDataStorageConfigPending]);

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
        <NewUserDataStorageConfigForm
          formRef={formRef}
          userIdToAddTo={props.userIdToAddTo}
          onAddedSuccessfully={props.onAddedSuccessfully}
          renderSubmitButton={false}
          isAddUserDataStorageConfigPending={isAddUserDataStorageConfigPending}
          setIsAddUserDataStorageConfigPending={setIsAddUserDataStorageConfigPending}
          extraErrors={extraErrors}
          setExtraErrors={setExtraErrors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button variant="contained" disabled={isSubmitButtonDisabled} onClick={handleSubmitButtonClick}>
          {isAddUserDataStorageConfigPending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDataStorageConfigFormDialog;
