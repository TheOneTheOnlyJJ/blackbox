import { Button, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import { appLogger } from "@renderer/utils/loggers";
import Form from "@rjsf/core";
import { enqueueSnackbar } from "notistack";
import { FC, Ref, useCallback, useMemo, useRef, useState } from "react";
import NewUserDataStorageVisibilityGroupConfigForm from "../../../../../../forms/user/data/storage/visibilityGroup/NewUserDataStorageVisibilityGroupConfigForm";
import { IAppRootContext, useAppRootContext } from "../../../../../../roots/appRoot/AppRootContext";

export interface INewUserDataStorageVisibilityGroupConfigFormDialogProps {
  userIdToAddTo: string;
  onAddedSuccessfully: () => void;
  onOpenedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const NewUserDataStorageVisibilityGroupConfigFormDialog: FC<INewUserDataStorageVisibilityGroupConfigFormDialogProps> = (
  props: INewUserDataStorageVisibilityGroupConfigFormDialogProps
) => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isAddUserDataStorageVisibilityGroupConfigPending, setIsAddUserDataStorageVisibilityGroupConfigPending] = useState<boolean>(false);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return isAddUserDataStorageVisibilityGroupConfigPending || appRootContext.userAccountStorageInfo === null
      ? true
      : !appRootContext.userAccountStorageInfo.backend.isOpen;
  }, [isAddUserDataStorageVisibilityGroupConfigPending, appRootContext.userAccountStorageInfo]);

  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("New User Data Storage Visibility Group Config form Submit button clicked.");
    if (isAddUserDataStorageVisibilityGroupConfigPending) {
      appLogger.warn("Add User Data Storage Visibility Group Config pending. No-op form sumit.");
      return;
    }
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid New User Data Storage Visibility Group Config form data.");
      return;
    }
    appLogger.info("Schema valid New User Data Storage Visibility Group Config form data. Submitting.");
    formRef.current.submit();
  }, [isAddUserDataStorageVisibilityGroupConfigPending]);

  const handleDialogClose = useCallback((): void => {
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
        <NewUserDataStorageVisibilityGroupConfigForm
          formRef={formRef}
          userIdToAddTo={props.userIdToAddTo}
          onAddedSuccessfully={props.onAddedSuccessfully}
          onOpenedSuccessfully={props.onOpenedSuccessfully}
          renderSubmitButton={false}
          isAddUserDataStorageVisibilityGroupConfigPending={isAddUserDataStorageVisibilityGroupConfigPending}
          setIsAddUserDataStorageVisibilityGroupConfigPending={setIsAddUserDataStorageVisibilityGroupConfigPending}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button variant="contained" disabled={isSubmitButtonDisabled} onClick={handleSubmitButtonClick}>
          {isAddUserDataStorageVisibilityGroupConfigPending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDataStorageVisibilityGroupConfigFormDialog;
