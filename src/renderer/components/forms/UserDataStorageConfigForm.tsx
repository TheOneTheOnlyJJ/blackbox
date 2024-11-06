import { FC, useCallback, useEffect } from "react";
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
import { USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA } from "@renderer/user/data/storage/uiSchemas/UserDataStorageConfigInputDataUiSchemas";
import { errorCapitalizerTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerTransformer";

const MUIForm = withTheme<UserDataStorageConfigInputData>(Theme);

const USER_DATA_STORAGE_CONFIG_INPUT_DATA_FORM_VALIDATOR = customizeValidator<UserDataStorageConfigInputData>();

const userDataStorageConfigInputDataFormTransformErrors: ErrorTransformer<UserDataStorageConfigInputData> = (
  errors: RJSFValidationError[]
): RJSFValidationError[] => {
  return errorCapitalizerTransformer(
    errors.filter((error: RJSFValidationError): boolean => {
      if (error.name === "additionalProperties") {
        // TODO: Add Logger messages here once specialised loggers are added
        return false;
      }
      if (error.name === "anyOf") {
        return false;
      }
      return true;
    })
  );
};

export interface IUserDataStorageConfigFormProps {
  formRef: FormProps["ref"];
  doRenderSubmitButton: boolean;
}

// TODO: Get title in error messages properly
const UserDataStorageConfigForm: FC<IUserDataStorageConfigFormProps> = (props: IUserDataStorageConfigFormProps) => {
  // TODO: Delete this
  useEffect(() => {
    appLogger.error(JSON.stringify(USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA, null, 2));
    appLogger.error(JSON.stringify(USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA, null, 2));
  }, []);
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
        ...USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA,
        "ui:submitButtonOptions": { norender: !props.doRenderSubmitButton }
      }}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      transformErrors={userDataStorageConfigInputDataFormTransformErrors}
      onSubmit={handleSubmit}
    />
  );
};

export default UserDataStorageConfigForm;
