import { FC, useCallback } from "react";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { CustomValidator, ErrorTransformer, FormValidation, RJSFSchema, RJSFValidationError } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { appLogger } from "@renderer/utils/loggers";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import {
  IUserDataStorageConfigCreateInput,
  USER_DATA_STORAGE_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_STORAGE_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/storage/config/create/input/UserDataStorageConfigCreateInput";
import { enqueueSnackbar } from "notistack";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { userDataStorageConfigCreateInputToUserDataStorageConfigCreateDTO } from "@renderer/user/data/storage/config/create/input/utils/userDataStorageConfigCreateInputToUserDataStorageConfigCreateDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";

const MUIForm = withTheme<IUserDataStorageConfigCreateInput>(Theme);

const USER_DATA_STORAGE_CONFIG_CREATE_INPUT_VALIDATOR = customizeValidator<IUserDataStorageConfigCreateInput>();

const newUserDataStorageConfigFormErrorTransformer: ErrorTransformer<IUserDataStorageConfigCreateInput> = (
  errors: RJSFValidationError[]
): RJSFValidationError[] => {
  return errorCapitalizerErrorTransformer(
    errors.filter((error: RJSFValidationError): boolean => {
      // RJSF cannot determine from which anyOf option the errors come from, so they're filtered out
      if (error.name === "additionalProperties") {
        appLogger.debug("Filtered additional properties error from new User Data Storage Config form.");
        return false;
      }
      // Error coming from no anyOf subschema validity is not relevant for the users, as the specific errors for the current anyOf subschema are displayed
      if (error.name === "anyOf") {
        appLogger.debug("Filtered anyOf error from new User Data Storage Config form.");
        return false;
      }
      return true;
    })
  );
};

const newUserDataStorageConfigFormValidator: CustomValidator<IUserDataStorageConfigCreateInput> = (
  formData: IUserDataStorageConfigCreateInput | undefined,
  errors: FormValidation<IUserDataStorageConfigCreateInput>
): FormValidation<IUserDataStorageConfigCreateInput> => {
  // Skip if no form data or errors
  if (formData === undefined || errors.visibilityPassword === undefined || errors.confirmVisibilityPassword === undefined) {
    return errors;
  }
  if (formData.visibilityPassword !== formData.confirmVisibilityPassword) {
    errors.confirmVisibilityPassword.addError("Does not match Visibility Password.");
  }
  return errors;
};

export interface INewUserDataStorageConfigFormProps {
  formRef: FormProps["ref"];
  userIdToAddTo: string;
  onAddedSuccessfully: () => void;
  noRenderSubmitButton: boolean;
}

const NewUserDataStorageConfigForm: FC<INewUserDataStorageConfigFormProps> = (props: INewUserDataStorageConfigFormProps) => {
  const { userIdToAddTo, onAddedSuccessfully } = props;
  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataStorageConfigCreateInput>): void => {
      appLogger.info("Submitted new User Data Storage form.");
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Storage Config Create Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const USER_DATA_STORAGE_CONFIG_CREATE_DTO: IUserDataStorageConfigCreateDTO = userDataStorageConfigCreateInputToUserDataStorageConfigCreateDTO(
        userIdToAddTo,
        data.formData,
        appLogger
      );
      window.IPCTLSAPI.encrypt<IUserDataStorageConfigCreateDTO>(USER_DATA_STORAGE_CONFIG_CREATE_DTO, "User Data Storage Config Create DTO")
        .then(
          (encryptedUserDataStorageConfigCreateDTO: IEncryptedData<IUserDataStorageConfigCreateDTO>): void => {
            const ADD_USER_DATA_STORAGE_CONFIG_TO_USER_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.addUserDataStorageConfig(
              encryptedUserDataStorageConfigCreateDTO
            );
            if (ADD_USER_DATA_STORAGE_CONFIG_TO_USER_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
              if (ADD_USER_DATA_STORAGE_CONFIG_TO_USER_RESPONSE.data) {
                enqueueSnackbar({ message: "Added User Data Storage Config.", variant: "success" });
                onAddedSuccessfully();
              } else {
                enqueueSnackbar({ message: "Could not add User Data Storage Config.", variant: "error" });
              }
            } else {
              enqueueSnackbar({ message: "Error adding User Data Storage Config.", variant: "error" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt User Data Storage Config Create DTO. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "User Data Storage Config encryption error.", variant: "error" });
          }
        )
        .catch((err: unknown): void => {
          const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
          appLogger.error(`Could not encrypt User Data Storage Config Create DTO. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "User Data Storage Config encryption error.", variant: "error" });
        });
    },
    [userIdToAddTo, onAddedSuccessfully]
  );

  return (
    <MUIForm
      ref={props.formRef}
      schema={USER_DATA_STORAGE_CONFIG_CREATE_INPUT_JSON_SCHEMA as RJSFSchema}
      validator={USER_DATA_STORAGE_CONFIG_CREATE_INPUT_VALIDATOR}
      uiSchema={{
        ...USER_DATA_STORAGE_CONFIG_CREATE_INPUT_UI_SCHEMA,
        "ui:submitButtonOptions": { norender: props.noRenderSubmitButton }
      }}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      customValidate={newUserDataStorageConfigFormValidator}
      transformErrors={newUserDataStorageConfigFormErrorTransformer}
      onSubmit={handleFormSubmit}
      noHtml5Validate={true}
    />
  );
};

export default NewUserDataStorageConfigForm;
