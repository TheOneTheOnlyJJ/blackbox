import { Button, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import { FC, Ref, useCallback, useMemo, useRef, useState } from "react";
import OpenUserDataStorageVisibilityGroupForm from "../../../../../../forms/user/data/storage/visibilityGroup/OpenUserDataStorageVisibilityGroupForm";
import Form from "@rjsf/core";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";
import { IAppRootContext, useAppRootContext } from "../../../../../../roots/appRoot/AppRootContext";

export interface IOpenUserDataStorageVisibilityGroupFormDialogProps {
  userIdToOpenFor: string;
  onOpenedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const OpenUserDataStorageVisibilityGroupFormDialog: FC<IOpenUserDataStorageVisibilityGroupFormDialogProps> = (
  props: IOpenUserDataStorageVisibilityGroupFormDialogProps
) => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isOpenUserDataStorageVisibilityGroupPending, setIsOpenUserDataStorageVisibilityGroupPending] = useState<boolean>(false);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return isOpenUserDataStorageVisibilityGroupPending || appRootContext.userAccountStorageInfo === null
      ? true
      : !appRootContext.userAccountStorageInfo.backend.isOpen;
  }, [isOpenUserDataStorageVisibilityGroupPending, appRootContext.userAccountStorageInfo]);

  const handleSubmitButtonClick = useCallback((): void => {
    appLogger.info("Open User Data Storage Visibility Group form Submit button clicked.");
    if (isOpenUserDataStorageVisibilityGroupPending) {
      appLogger.warn("Open User Data Storage Visibility Group pending. No-op form sumit.");
      return;
    }
    if (!formRef.current?.validateForm()) {
      enqueueSnackbar({ message: "Invalid form data.", variant: "warning" });
      appLogger.warn("Invalid Open User Data Storage Visibility Group form data.");
      return;
    }
    appLogger.info("Schema valid Open User Data Storage Visibility Group form data. Submitting.");
    formRef.current.submit();
  }, [isOpenUserDataStorageVisibilityGroupPending]);

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
        <OpenUserDataStorageVisibilityGroupForm
          formRef={formRef}
          userIdToOpenFor={props.userIdToOpenFor}
          onOpenedSuccessfully={props.onOpenedSuccessfully}
          renderSubmitButton={false}
          isOpenUserDataStorageVisibilityGroupPending={isOpenUserDataStorageVisibilityGroupPending}
          setIsOpenUserDataStorageVisibilityGroupPending={setIsOpenUserDataStorageVisibilityGroupPending}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button variant="contained" disabled={isSubmitButtonDisabled} onClick={handleSubmitButtonClick}>
          {isOpenUserDataStorageVisibilityGroupPending ? "Opening..." : "Open"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpenUserDataStorageVisibilityGroupFormDialog;
