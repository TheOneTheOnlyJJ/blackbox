import { FC, useCallback } from "react";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { ErrorTransformer, RJSFSchema, RJSFValidationError } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";
import { errorCapitalizerTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerTransformer";
import {
  IUserDataStorageConfigWithMetadataInputData,
  USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_JSON_SCHEMA
} from "@shared/user/data/storage/inputData/UserDataStorageConfigWithMetadataInputData";
import { USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_UI_SCHEMA } from "@renderer/user/data/storage/uiSchemas/UserDataStorageConfigWithMetadataInputDataUiSchema";

const MUIForm = withTheme<IUserDataStorageConfigWithMetadataInputData>(Theme);

const USER_DATA_STORAGE_CONFIG_INPUT_DATA_FORM_VALIDATOR = customizeValidator<IUserDataStorageConfigWithMetadataInputData>();

const userDataStorageConfigInputDataFormTransformErrors: ErrorTransformer<IUserDataStorageConfigWithMetadataInputData> = (
  errors: RJSFValidationError[]
): RJSFValidationError[] => {
  return errorCapitalizerTransformer(
    errors.filter((error: RJSFValidationError): boolean => {
      // RJSF cannot determine from which anyOf option the errors come from, so they're filtered out
      if (error.name === "additionalProperties") {
        appLogger.debug("Filtered additional properties error from User Data Storage Config input data form.");
        return false;
      }
      // Error coming from no anyOf subschema validity is not relevant for the users, as the specific errors for the current anyOf subschema are displayed
      if (error.name === "anyOf") {
        appLogger.debug("Filtered anyOf error from User Data Storage Config input data form.");
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
  const handleSubmit = useCallback((data: IChangeEvent<IUserDataStorageConfigWithMetadataInputData>): void => {
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
      schema={USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_JSON_SCHEMA as RJSFSchema}
      validator={USER_DATA_STORAGE_CONFIG_INPUT_DATA_FORM_VALIDATOR}
      uiSchema={{
        ...USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_UI_SCHEMA,
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
