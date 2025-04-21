import { Button } from "@mui/material";
import { ISelectedUserDataStorageIdFormContext } from "@renderer/components/forms/contexts/SelectedUserDataStorageIdFormContext";
import {
  IUserDataTemplateCreateInput,
  USER_DATA_TEMPLATE_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_TEMPLATE_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/template/create/input/UserDataTemplateCreateInput";
import { userDataTemplateCreateInputToUserDataTemplateCreateDTO } from "@renderer/user/data/template/create/input/utils/userDataTemplateCreateInputToUserDataTemplateCreateDTO";
import { appLogger } from "@renderer/utils/loggers";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { RJSFValidationError, RJSFSchema, toErrorSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { IUserDataTemplateCreateDTO } from "@shared/user/data/template/create/DTO/UserDataTemplateCreateDTO";
import { IUserDataTemplateNameAvailabilityRequest } from "@shared/user/data/template/create/UserDataTemplateNameAvailabilityRequest";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, FC, useMemo, useCallback, useState } from "react";

const MUIForm = withTheme<IUserDataTemplateCreateInput, RJSFSchema, ISelectedUserDataStorageIdFormContext>(Theme);

const isValidUserDataTemplateCreateInput = customizeValidator<IUserDataTemplateCreateInput>();

export interface INewUserDataTemplateFormProps {
  formRef: FormProps["ref"];
  onAddedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isAddUserDataTemplatePending: boolean;
  setIsAddUserDataTemplatePending: Dispatch<SetStateAction<boolean>>;
  extraErrors: RJSFValidationError[];
  setExtraErrors: Dispatch<SetStateAction<RJSFValidationError[]>>;
}

const NewUserDataTemplateForm: FC<INewUserDataTemplateFormProps> = (props: INewUserDataTemplateFormProps) => {
  const [formData, setFormData] = useState<IUserDataTemplateCreateInput | undefined>(undefined);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    // TODO: Check if this is all that's really needed?
    return props.isAddUserDataTemplatePending;
  }, [props.isAddUserDataTemplatePending]);

  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataTemplateCreateInput>): void => {
      appLogger.info("Submitted new User Data Template form.");
      if (props.isAddUserDataTemplatePending) {
        appLogger.warn("Add User Data Template pending. No-op form sumit.");
        return;
      }
      props.setIsAddUserDataTemplatePending(true);
      props.setExtraErrors([]);
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Template Create Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const FORM_DATA: IUserDataTemplateCreateInput = data.formData;
      window.IPCTLSAPI.encrypt<IUserDataTemplateNameAvailabilityRequest>(
        { name: FORM_DATA.name, storageId: FORM_DATA.storageId, boxId: FORM_DATA.boxId } satisfies IUserDataTemplateNameAvailabilityRequest,
        "User Data Template name availability request"
      )
        .then(
          async (encryptedUserDataTemplateNameAvailabilityRequest: IEncryptedData<IUserDataTemplateNameAvailabilityRequest>): Promise<void> => {
            const IS_USER_DATA_TEMPLATE_NAME_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> = window.userDataTemplateAPI.isUserDataTemplateNameAvailable(
              encryptedUserDataTemplateNameAvailabilityRequest
            );
            if (IS_USER_DATA_TEMPLATE_NAME_AVAILABLE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
              appLogger.error("Could not get name availability.");
              props.setExtraErrors((prevExtraErrors: RJSFValidationError[]): RJSFValidationError[] => {
                return [
                  ...prevExtraErrors,
                  {
                    property: ".name",
                    message: "Could not get name availability.",
                    stack: "Could not get name availability."
                  } satisfies RJSFValidationError
                ];
              });
            } else {
              if (IS_USER_DATA_TEMPLATE_NAME_AVAILABLE_RESPONSE.data) {
                const USER_DATA_TEMPLATE_CREATE_DTO: IUserDataTemplateCreateDTO = userDataTemplateCreateInputToUserDataTemplateCreateDTO(
                  FORM_DATA,
                  appLogger
                );
                try {
                  const ENCRYPTED_USER_DATA_TEMPLATE_CREATE_DTO: IEncryptedData<IUserDataTemplateCreateDTO> =
                    await window.IPCTLSAPI.encrypt<IUserDataTemplateCreateDTO>(USER_DATA_TEMPLATE_CREATE_DTO, "User Data Template Create DTO");
                  const ADD_USER_DATA_TEMPLATE_RESPONSE: IPCAPIResponse<boolean> = window.userDataTemplateAPI.addUserDataTemplate(
                    ENCRYPTED_USER_DATA_TEMPLATE_CREATE_DTO
                  );
                  if (ADD_USER_DATA_TEMPLATE_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
                    if (ADD_USER_DATA_TEMPLATE_RESPONSE.data) {
                      setFormData(undefined);
                      appLogger.debug("Added User Data Template.");
                      enqueueSnackbar({ message: "Added data template.", variant: "success" });
                      props.onAddedSuccessfully();
                    } else {
                      appLogger.error("Could not add User Data Template.");
                      enqueueSnackbar({ message: "Could not add data template.", variant: "error" });
                    }
                  } else {
                    appLogger.error("Error adding User Data Template.");
                    enqueueSnackbar({ message: "Error adding data template.", variant: "error" });
                  }
                } catch (error: unknown) {
                  const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
                  appLogger.error(`Could not encrypt User Data Template Create DTO: ${ERROR_MESSAGE}.`);
                  enqueueSnackbar({ message: "Data template encryption error.", variant: "error" });
                }
              } else {
                appLogger.warn("User Data Template name not available.");
                props.setExtraErrors((prevExtraErrors: RJSFValidationError[]): RJSFValidationError[] => {
                  return [
                    ...prevExtraErrors,
                    {
                      property: ".name",
                      message: `Name "${FORM_DATA.name}" is not available.`,
                      stack: `Name "${FORM_DATA.name}" is not available.`
                    } satisfies RJSFValidationError
                  ];
                });
              }
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt User Data Template name availability request. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Data template name availability request encryption error.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt User Data Template name availability request. Error: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Data template name availability request encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsAddUserDataTemplatePending(false);
        });
    },
    [props]
  );

  const handleFormOnChange = useCallback((data: IChangeEvent<IUserDataTemplateCreateInput>): void => {
    setFormData(data.formData);
  }, []);

  return (
    <MUIForm
      ref={props.formRef}
      schema={USER_DATA_TEMPLATE_CREATE_INPUT_JSON_SCHEMA as RJSFSchema}
      validator={isValidUserDataTemplateCreateInput}
      uiSchema={{ ...USER_DATA_TEMPLATE_CREATE_INPUT_UI_SCHEMA, "ui:submitButtonOptions": { norender: !props.renderSubmitButton } }}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      transformErrors={errorCapitalizerErrorTransformer}
      onSubmit={handleFormSubmit}
      extraErrors={toErrorSchema<IUserDataTemplateCreateInput>(props.extraErrors)}
      extraErrorsBlockSubmit={false}
      noHtml5Validate={true}
      formData={formData}
      onChange={handleFormOnChange}
      formContext={{ selectedUserDataStorageId: formData?.storageId }}
    >
      {props.renderSubmitButton && (
        <Button type="submit" disabled={isSubmitButtonDisabled} variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
          {props.isAddUserDataTemplatePending ? "Submitting..." : "Submit"}
        </Button>
      )}
    </MUIForm>
  );
};

export default NewUserDataTemplateForm;
