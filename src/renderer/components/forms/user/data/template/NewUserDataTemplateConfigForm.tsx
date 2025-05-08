import { Button } from "@mui/material";
import { ISelectedUserDataStorageIdFormContext } from "@renderer/components/forms/contexts/SelectedUserDataStorageIdFormContext";
import {
  IUserDataTemplateConfigCreateInput,
  USER_DATA_TEMPLATE_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_TEMPLATE_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/template/config/create/input/UserDataTemplateConfigCreateInput";
import { userDataTemplateConfigCreateInputToUserDataTemplateConfigCreateDTO } from "@renderer/user/data/template/config/create/input/utils/userDataTemplateConfigCreateInputToUserDataTemplateConfigCreateDTO";
import { UserDataTemplateFieldConfigCreateInput } from "@renderer/user/data/template/field/config/create/input/UserDataTemplateFieldConfigCreateInput";
import { appLogger } from "@renderer/utils/loggers";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { RJSFValidationError, RJSFSchema, toErrorSchema, ErrorTransformer, CustomValidator, FormValidation } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { IUserDataTemplateConfigCreateDTO } from "@shared/user/data/template/config/create/DTO/UserDataTemplateConfigCreateDTO";
import { IUserDataTemplateNameAvailabilityRequest } from "@shared/user/data/template/config/create/UserDataTemplateNameAvailabilityRequest";
import { AJV_OPTIONS } from "@shared/utils/AJVJSONValidator";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, FC, useMemo, useCallback, useState } from "react";

const MUIForm = withTheme<IUserDataTemplateConfigCreateInput, RJSFSchema, ISelectedUserDataStorageIdFormContext>(Theme);

const isValidUserDataTemplateConfigCreateInput = customizeValidator<IUserDataTemplateConfigCreateInput>({
  ajvOptionsOverrides: AJV_OPTIONS // TODO: Delete this?
});

const newUserDataTemplateConfigFormErrorTransformer: ErrorTransformer<IUserDataTemplateConfigCreateInput> = (
  errors: RJSFValidationError[]
): RJSFValidationError[] => {
  return errorCapitalizerErrorTransformer(
    errors.filter((error: RJSFValidationError): boolean => {
      // RJSF cannot determine from which anyOf option the errors come from, so they're filtered out
      if (error.name === "additionalProperties") {
        appLogger.debug("Filtered additional properties error from new User Data Template Config form.");
        return false;
      }
      // Error coming from no anyOf subschema validity is not relevant for the users, as the specific errors for the current anyOf subschema are displayed
      if (error.name === "anyOf") {
        appLogger.debug("Filtered anyOf error from new User Data Template Config form.");
        return false;
      }
      return true;
    })
  );
};

const newUserDataTemplateConfigFormValidator: CustomValidator<IUserDataTemplateConfigCreateInput> = (
  formData: IUserDataTemplateConfigCreateInput | undefined,
  errors: FormValidation<IUserDataTemplateConfigCreateInput>
): FormValidation<IUserDataTemplateConfigCreateInput> => {
  // Skip if no form data or errors
  if (formData === undefined || errors.fields === undefined) {
    return errors;
  }
  const FIELD_NAME_COUNTS: Map<string, number> = formData.fields.reduce(
    (acc: Map<string, number>, fieldConfigCreateInput: UserDataTemplateFieldConfigCreateInput): Map<string, number> => {
      const FIELD_NAME: string = fieldConfigCreateInput.name;
      acc.set(FIELD_NAME, (acc.get(FIELD_NAME) ?? 0) + 1);
      return acc;
    },
    new Map<string, number>()
  );
  const FIELD_NAME_DUPLICATES: [string, number][] = Array.from(FIELD_NAME_COUNTS.entries()).filter(
    ([, fieldNameCount]: [string, number]): boolean => {
      return fieldNameCount > 1;
    }
  );
  if (FIELD_NAME_DUPLICATES.length > 0) {
    const FORMATTED_DUPLICATE_FIELD_NAMES: string[] = FIELD_NAME_DUPLICATES.map(([fieldName, fieldNameCount]: [string, number]) => {
      return `"${fieldName}" (${fieldNameCount.toString()})`;
    });
    let duplicateFieldNamesDisplayString: string;
    if (FORMATTED_DUPLICATE_FIELD_NAMES.length === 1) {
      duplicateFieldNamesDisplayString = FORMATTED_DUPLICATE_FIELD_NAMES.join(", ");
    } else {
      const LAST_FORMATTED_DUPLICATE_FIELD_NAME: string | undefined = FORMATTED_DUPLICATE_FIELD_NAMES.pop();
      if (LAST_FORMATTED_DUPLICATE_FIELD_NAME === undefined) {
        throw new Error("Undefined last formatted duplicate field name");
      }
      duplicateFieldNamesDisplayString = `${FORMATTED_DUPLICATE_FIELD_NAMES.join(", ")} and ${LAST_FORMATTED_DUPLICATE_FIELD_NAME}`;
    }
    const DUPLICATE_FIELD_NAMES_ERROR_MESSAGE = `All names must be unique! Name${
      FIELD_NAME_DUPLICATES.length === 1 ? "" : "s"
    } ${duplicateFieldNamesDisplayString} ${FIELD_NAME_DUPLICATES.length === 1 ? "is" : "are"} not unique.`;
    errors.fields.addError(DUPLICATE_FIELD_NAMES_ERROR_MESSAGE);
  }
  return errors;
};

export interface INewUserDataTemplateConfigFormProps {
  formRef: FormProps["ref"];
  onAddedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isAddUserDataTemplateConfigPending: boolean;
  setIsAddUserDataTemplateConfigPending: Dispatch<SetStateAction<boolean>>;
  extraErrors: RJSFValidationError[];
  setExtraErrors: Dispatch<SetStateAction<RJSFValidationError[]>>;
}

const NewUserDataTemplateConfigForm: FC<INewUserDataTemplateConfigFormProps> = (props: INewUserDataTemplateConfigFormProps) => {
  const [formData, setFormData] = useState<IUserDataTemplateConfigCreateInput | undefined>(undefined);

  // TODO: Delete this
  // useEffect((): void => {
  //   appLogger.error(`FORM DATA CHANGED:\n${JSON.stringify(formData, null, 2)}`);
  // }, [formData]);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    // TODO: Check if this is all that's really needed?
    return props.isAddUserDataTemplateConfigPending;
  }, [props.isAddUserDataTemplateConfigPending]);

  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataTemplateConfigCreateInput>): void => {
      appLogger.info("Submitted new User Data Template Config form.");
      if (props.isAddUserDataTemplateConfigPending) {
        appLogger.warn("Add User Data Template Config pending. No-op form sumit.");
        return;
      }
      props.setIsAddUserDataTemplateConfigPending(true);
      props.setExtraErrors([]);
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Template Config Create Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const FORM_DATA: IUserDataTemplateConfigCreateInput = data.formData;
      // TODO: Delete this
      appLogger.error(`FORM DATA\n${JSON.stringify(FORM_DATA, null, 2)}`);
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
                const USER_DATA_TEMPLATE_CONFIG_CREATE_DTO: IUserDataTemplateConfigCreateDTO =
                  userDataTemplateConfigCreateInputToUserDataTemplateConfigCreateDTO(FORM_DATA, appLogger);
                // TODO: Delete this
                appLogger.error(`FORM DATA DTO\n${JSON.stringify(USER_DATA_TEMPLATE_CONFIG_CREATE_DTO, null, 2)}`);
                try {
                  const ENCRYPTED_USER_DATA_TEMPLATE_CONFIG_CREATE_DTO: IEncryptedData<IUserDataTemplateConfigCreateDTO> =
                    await window.IPCTLSAPI.encrypt<IUserDataTemplateConfigCreateDTO>(
                      USER_DATA_TEMPLATE_CONFIG_CREATE_DTO,
                      "User Data Template Config Create DTO"
                    );
                  const ADD_USER_DATA_TEMPLATE_RESPONSE: IPCAPIResponse<boolean> = window.userDataTemplateAPI.addUserDataTemplateConfig(
                    ENCRYPTED_USER_DATA_TEMPLATE_CONFIG_CREATE_DTO
                  );
                  if (ADD_USER_DATA_TEMPLATE_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
                    if (ADD_USER_DATA_TEMPLATE_RESPONSE.data) {
                      setFormData(undefined);
                      appLogger.debug("Added User Data Template Config.");
                      enqueueSnackbar({ message: "Added data template.", variant: "success" });
                      props.onAddedSuccessfully();
                    } else {
                      appLogger.error("Could not add User Data Template Config.");
                      enqueueSnackbar({ message: "Could not add data template.", variant: "error" });
                    }
                  } else {
                    appLogger.error("Error adding User Data Template Config.");
                    enqueueSnackbar({ message: "Error adding data template.", variant: "error" });
                  }
                } catch (error: unknown) {
                  const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
                  appLogger.error(`Could not encrypt User Data Template Config Create DTO: ${ERROR_MESSAGE}.`);
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
          props.setIsAddUserDataTemplateConfigPending(false);
        });
    },
    [props]
  );

  const handleFormOnChange = useCallback((data: IChangeEvent<IUserDataTemplateConfigCreateInput>): void => {
    setFormData(data.formData);
  }, []);

  return (
    <MUIForm
      ref={props.formRef}
      schema={USER_DATA_TEMPLATE_CONFIG_CREATE_INPUT_JSON_SCHEMA as RJSFSchema}
      validator={isValidUserDataTemplateConfigCreateInput}
      uiSchema={{ ...USER_DATA_TEMPLATE_CONFIG_CREATE_INPUT_UI_SCHEMA, "ui:submitButtonOptions": { norender: !props.renderSubmitButton } }}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      customValidate={newUserDataTemplateConfigFormValidator}
      transformErrors={newUserDataTemplateConfigFormErrorTransformer}
      onSubmit={handleFormSubmit}
      extraErrors={toErrorSchema<IUserDataTemplateConfigCreateInput>(props.extraErrors)}
      extraErrorsBlockSubmit={false}
      noHtml5Validate={true}
      formData={formData}
      onChange={handleFormOnChange}
      formContext={{ selectedUserDataStorageId: formData?.storageId }}
    >
      {props.renderSubmitButton && (
        <Button type="submit" disabled={isSubmitButtonDisabled} variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
          {props.isAddUserDataTemplateConfigPending ? "Submitting..." : "Submit"}
        </Button>
      )}
    </MUIForm>
  );
};

export default NewUserDataTemplateConfigForm;
