import { Button } from "@mui/material";
import {
  IUserDataTemplateCreateInput,
  USER_DATA_TEMPLATE_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_TEMPLATE_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/template/create/input/UserDataTemplateCreateInput";
import { appLogger } from "@renderer/utils/loggers";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { RJSFValidationError, RJSFSchema, toErrorSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, FC, useMemo, useCallback } from "react";

const MUIForm = withTheme<IUserDataTemplateCreateInput>(Theme);

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
      // const FORM_DATA: IUserDataTemplateCreateInput = data.formData;
      // window.IPCTLSAPI.encrypt<IUserDataBoxNameAvailabilityRequest>(
      //   { name: FORM_DATA.name, storageId: FORM_DATA.storageId } satisfies IUserDataBoxNameAvailabilityRequest,
      //   "User Data Box name availability request"
      // )
      //   .then(
      //     async (encryptedUserDataBoxNameAvailabilityRequest: IEncryptedData<IUserDataBoxNameAvailabilityRequest>): Promise<void> => {
      //       const IS_USER_DATA_BOX_NAME_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> =
      //         window.userDataBoxAPI.isUserDataBoxNameAvailableForUserDataStorage(encryptedUserDataBoxNameAvailabilityRequest);
      //       if (IS_USER_DATA_BOX_NAME_AVAILABLE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      //         // props.errorSchemaBuilder.setErrors("Could not get username availability.", "name");
      //         props.setExtraErrors((prevExtraErrors: RJSFValidationError[]): RJSFValidationError[] => {
      //           return [
      //             ...prevExtraErrors,
      //             {
      //               property: ".name",
      //               message: "Could not get name availability.",
      //               stack: "Could not get name availability."
      //             } satisfies RJSFValidationError
      //           ];
      //         });
      //       } else {
      //         if (IS_USER_DATA_BOX_NAME_AVAILABLE_RESPONSE.data) {
      //           const USER_DATA_BOX_Template_CREATE_DTO: IUserDataTemplateCreateDTO = userDataTemplateCreateInputToUserDataTemplateCreateDTO(
      //             FORM_DATA,
      //             appLogger
      //           );
      //           try {
      //             const ENCRYPTED_USER_DATA_BOX_Template_CREATE_DTO: IEncryptedData<IUserDataTemplateCreateDTO> =
      //               await window.IPCTLSAPI.encrypt<IUserDataTemplateCreateDTO>(USER_DATA_BOX_Template_CREATE_DTO, "User Data Box Template Create DTO");
      //             const ADD_USER_DATA_BOX_Template_RESPONSE: IPCAPIResponse<boolean> = window.userDataBoxAPI.addUserDataTemplate(
      //               ENCRYPTED_USER_DATA_BOX_Template_CREATE_DTO
      //             );
      //             if (ADD_USER_DATA_BOX_Template_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      //               if (ADD_USER_DATA_BOX_Template_RESPONSE.data) {
      //                 enqueueSnackbar({ message: "Added data box.", variant: "success" });
      //                 props.onAddedSuccessfully();
      //               } else {
      //                 enqueueSnackbar({ message: "Could not add data box.", variant: "error" });
      //               }
      //             } else {
      //               enqueueSnackbar({ message: "Error adding data box.", variant: "error" });
      //             }
      //           } catch (error: unknown) {
      //             const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      //             appLogger.error(`Could not encrypt User Data Box Template Create DTO: ${ERROR_MESSAGE}.`);
      //             enqueueSnackbar({ message: "Data box encryption error.", variant: "error" });
      //           }
      //         } else {
      //           props.setExtraErrors((prevExtraErrors: RJSFValidationError[]): RJSFValidationError[] => {
      //             return [
      //               ...prevExtraErrors,
      //               {
      //                 property: ".name",
      //                 message: `Name "${FORM_DATA.name}" is not available.`,
      //                 stack: `Name "${FORM_DATA.name}" is not available.`
      //               } satisfies RJSFValidationError
      //             ];
      //           });
      //         }
      //       }
      //     },
      //     (reason: unknown): void => {
      //       const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
      //       appLogger.error(`Could not encrypt User Data Box name availability request. Reason: ${REASON_MESSAGE}.`);
      //       enqueueSnackbar({ message: "Data box name availability request encryption error.", variant: "error" });
      //     }
      //   )
      //   .catch((error: unknown): void => {
      //     const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      //     appLogger.error(`Could not encrypt User Data Box name availability request. Reason: ${ERROR_MESSAGE}.`);
      //     enqueueSnackbar({ message: "Data box name availability request encryption error.", variant: "error" });
      //   })
      //   .finally((): void => {
      //     props.setIsAddUserDataTemplatePending(false);
      //   });
    },
    [props]
  );

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
