import { Button } from "@mui/material";
import { ISelectedUserDataStorageIdFormContext } from "@renderer/components/forms/contexts/SelectedUserDataStorageIdFormContext";
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
      // TODO: Implement this. Add template API, etc
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
