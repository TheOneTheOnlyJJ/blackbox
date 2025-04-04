import { Dispatch, FC, SetStateAction, useCallback, useMemo } from "react";
import { Theme } from "@rjsf/mui";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Button } from "@mui/material";
import {
  IUserDataBoxConfigCreateInput,
  USER_DATA_BOX_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_BOX_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/box/config/create/input/UserDataBoxConfigCreateInput";
import { RJSFSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { injectDefaultsInJSONSchema } from "@shared/utils/injectDefaultsInJSONSchema";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";
import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { userDataBoxConfigCreateInputToUserDataBoxConfigCreateDTO } from "@renderer/user/data/box/config/create/input/utils/userDataBoxConfigCreateInputToUserDataBoxConfigCreateDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";

const MUIForm = withTheme<IUserDataBoxConfigCreateInput>(Theme);

const isValidUserDataBoxConfigCreateInput = customizeValidator<IUserDataBoxConfigCreateInput>();

export interface INewUserDataBoxConfigFormProps {
  formRef: FormProps["ref"];
  defaultValues: Partial<IUserDataBoxConfigCreateInput> | null;
  onAddedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isAddUserDataBoxConfigPending: boolean;
  setIsAddUserDataBoxConfigPending: Dispatch<SetStateAction<boolean>>;
}

const NewUserDataBoxConfigForm: FC<INewUserDataBoxConfigFormProps> = (props: INewUserDataBoxConfigFormProps) => {
  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    // TODO: Check if this is all that's really needed?
    return props.isAddUserDataBoxConfigPending;
  }, [props.isAddUserDataBoxConfigPending]);

  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataBoxConfigCreateInput>): void => {
      appLogger.info("Submitted new User Data Box Config form.");
      if (props.isAddUserDataBoxConfigPending) {
        appLogger.warn("Add User Data Box Config pending. No-op form sumit.");
        return;
      }
      props.setIsAddUserDataBoxConfigPending(true);
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Box Config Create Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const USER_DATA_BOX_CONFIG_CREATE_DTO: IUserDataBoxConfigCreateDTO = userDataBoxConfigCreateInputToUserDataBoxConfigCreateDTO(
        data.formData,
        appLogger
      );
      window.IPCTLSAPI.encrypt<IUserDataBoxConfigCreateDTO>(USER_DATA_BOX_CONFIG_CREATE_DTO, "User Data Box Config Create DTO")
        .then(
          (encryptedUserDataBoxConfigCreateDTO: IEncryptedData<IUserDataBoxConfigCreateDTO>): void => {
            const ADD_USER_DATA_BOX_CONFIG_RESPONSE: IPCAPIResponse<boolean> =
              window.userDataBoxAPI.addNewUserDataBox(encryptedUserDataBoxConfigCreateDTO);
            if (ADD_USER_DATA_BOX_CONFIG_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
              if (ADD_USER_DATA_BOX_CONFIG_RESPONSE.data) {
                enqueueSnackbar({ message: "Added User Data Box Config.", variant: "success" });
                props.onAddedSuccessfully();
              } else {
                enqueueSnackbar({ message: "Could not add User Data Box Config.", variant: "error" });
              }
            } else {
              enqueueSnackbar({ message: "Error adding User Data Box Config.", variant: "error" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt User Data Box Config Create DTO. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "User Data Box Config encryption error.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt User Data Box Config Create DTO. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "User Data Box Config encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsAddUserDataBoxConfigPending(false);
        });
    },
    [props]
  );

  return (
    <MUIForm
      ref={props.formRef}
      schema={
        props.defaultValues === null
          ? (USER_DATA_BOX_CONFIG_CREATE_INPUT_JSON_SCHEMA as RJSFSchema)
          : (injectDefaultsInJSONSchema(USER_DATA_BOX_CONFIG_CREATE_INPUT_JSON_SCHEMA, props.defaultValues) as RJSFSchema)
      }
      validator={isValidUserDataBoxConfigCreateInput}
      uiSchema={{ ...USER_DATA_BOX_CONFIG_CREATE_INPUT_UI_SCHEMA, "ui:submitButtonOptions": { norender: !props.renderSubmitButton } }}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      // TODO: Check is data box name is available for selected storage id
      // customValidate={newUserDataStorageConfigFormValidator}
      // transformErrors={}
      onSubmit={handleFormSubmit}
      noHtml5Validate={true}
    >
      {props.renderSubmitButton && (
        <Button type="submit" disabled={isSubmitButtonDisabled} variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
          {props.isAddUserDataBoxConfigPending ? "Submitting..." : "Submit"}
        </Button>
      )}
    </MUIForm>
  );
};

export default NewUserDataBoxConfigForm;
