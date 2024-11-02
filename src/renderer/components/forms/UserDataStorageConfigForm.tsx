import { FC, useCallback } from "react";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { ErrorTransformer, RJSFSchema, RJSFValidationError } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";
import {
  USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA,
  UserDataStorageConfigInputData
} from "@shared/user/data/storage/inputData/UserDataStorageConfigInputData";

const MUIForm = withTheme<UserDataStorageConfigInputData>(Theme);

const USER_DATA_STORAGE_CONFIG_INPUT_DATA_FORM_VALIDATOR = customizeValidator<UserDataStorageConfigInputData>();

const userDataStorageConfigInputDataFormTransformErrors: ErrorTransformer<UserDataStorageConfigInputData> = (
  errors: RJSFValidationError[]
): RJSFValidationError[] => {
  return errors.map((error: RJSFValidationError) => {
    // Capitalize first letter
    if (error.message !== undefined) {
      error.message = error.message.charAt(0).toUpperCase() + error.message.slice(1) + ".";
    }
    error.stack = error.stack.charAt(0).toUpperCase() + error.stack.slice(1) + ".";
    return error;
  });
};

export interface IUserDataStorageConfigFormProps {
  formRef: FormProps["ref"];
  doRenderSubmitButton: boolean;
}

const UserDataStorageConfigForm: FC<IUserDataStorageConfigFormProps> = (props: IUserDataStorageConfigFormProps) => {
  const handleSubmit = useCallback((data: IChangeEvent<UserDataStorageConfigInputData>): void => {
    if (data.formData === undefined) {
      appLogger.error("Undefined User Data Storage Config form data. No-op.");
      enqueueSnackbar({ message: "Missing form data.", variant: "error" });
      return;
    }
    appLogger.info("Submitted User Data Storage Config form data.");
    enqueueSnackbar({ message: "Submitted form data.", variant: "info" });
  }, []);

  return (
    <MUIForm
      ref={props.formRef}
      schema={USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA as RJSFSchema}
      validator={USER_DATA_STORAGE_CONFIG_INPUT_DATA_FORM_VALIDATOR}
      uiSchema={{
        "ui:submitButtonOptions": { norender: !props.doRenderSubmitButton }
      }}
      showErrorList={false}
      transformErrors={userDataStorageConfigInputDataFormTransformErrors}
      onSubmit={handleSubmit}
    />
  );
};

export default UserDataStorageConfigForm;
