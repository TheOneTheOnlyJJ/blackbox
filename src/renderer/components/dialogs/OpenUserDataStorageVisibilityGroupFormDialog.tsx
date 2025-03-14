import { Button, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import { FC, Ref, useCallback, useRef, useState } from "react";
import OpenUserDataStorageVisibilityGroupForm from "../forms/OpenUserDataStorageVisibilityGroupForm";
import Form from "@rjsf/core";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";

export interface IOpenUserDataStorageVisibilityGroupFormDialogProps {
  userIdToOpenFor: string;
  onOpenedSuccessfully: () => void;
  open: DialogProps["open"];
  onClose: () => void;
}

const OpenUserDataStorageVisibilityGroupFormDialog: FC<IOpenUserDataStorageVisibilityGroupFormDialogProps> = (
  props: IOpenUserDataStorageVisibilityGroupFormDialogProps
) => {
  const formRef: Ref<Form> = useRef<Form>(null);
  const [isOpenUserDataStorageVisibilityGroupPending, setIsOpenUserDataStorageVisibilityGroupPending] = useState<boolean>(false);

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
    appLogger.info("Valid Open User Data Storage Visibility Group form data. Submitting.");
    formRef.current.submit();
  }, [isOpenUserDataStorageVisibilityGroupPending]);

  return (
    <Dialog maxWidth="md" fullWidth={true} open={props.open} onClose={props.onClose}>
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
        <Button onClick={props.onClose}>Cancel</Button>
        <Button variant="contained" disabled={isOpenUserDataStorageVisibilityGroupPending} onClick={handleSubmitButtonClick}>
          {isOpenUserDataStorageVisibilityGroupPending ? "Opening..." : "Open"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpenUserDataStorageVisibilityGroupFormDialog;
