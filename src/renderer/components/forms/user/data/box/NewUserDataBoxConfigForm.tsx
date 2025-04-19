import { Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from "react";
import { Theme } from "@rjsf/mui";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Button } from "@mui/material";
import {
  IUserDataBoxConfigCreateInput,
  USER_DATA_BOX_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_BOX_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/box/config/create/input/UserDataBoxConfigCreateInput";
import { RJSFSchema, RJSFValidationError, toErrorSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { injectDefaultsInJSONSchema } from "@shared/utils/injectDefaultsInJSONSchema";
import { appLogger } from "@renderer/utils/loggers";
import { enqueueSnackbar } from "notistack";
import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { userDataBoxConfigCreateInputToUserDataBoxConfigCreateDTO } from "@renderer/user/data/box/config/create/input/utils/userDataBoxConfigCreateInputToUserDataBoxConfigCreateDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { IUserDataBoxNameAvailabilityRequest } from "@shared/user/data/box/create/UserDataBoxNameAvailabilityRequest";

const MUIForm = withTheme<IUserDataBoxConfigCreateInput>(Theme);

const isValidUserDataBoxConfigCreateInput = customizeValidator<IUserDataBoxConfigCreateInput>();

export interface INewUserDataBoxConfigFormProps {
  formRef: FormProps["ref"];
  defaultValues: Partial<IUserDataBoxConfigCreateInput> | null;
  onAddedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isAddUserDataBoxConfigPending: boolean;
  setIsAddUserDataBoxConfigPending: Dispatch<SetStateAction<boolean>>;
  // errorSchemaBuilder: ErrorSchemaBuilder;
  extraErrors: RJSFValidationError[];
  setExtraErrors: Dispatch<SetStateAction<RJSFValidationError[]>>;
}

const NewUserDataBoxConfigForm: FC<INewUserDataBoxConfigFormProps> = (props: INewUserDataBoxConfigFormProps) => {
  const [formData, setFormData] = useState<IUserDataBoxConfigCreateInput | undefined>(undefined);

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
      // props.errorSchemaBuilder.resetAllErrors();
      props.setExtraErrors([]);
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Box Config Create Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const FORM_DATA: IUserDataBoxConfigCreateInput = data.formData;
      window.IPCTLSAPI.encrypt<IUserDataBoxNameAvailabilityRequest>(
        { name: FORM_DATA.name, storageId: FORM_DATA.storageId } satisfies IUserDataBoxNameAvailabilityRequest,
        "User Data Box name availability request"
      )
        .then(
          async (encryptedUserDataBoxNameAvailabilityRequest: IEncryptedData<IUserDataBoxNameAvailabilityRequest>): Promise<void> => {
            const IS_USER_DATA_BOX_NAME_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> =
              window.userDataBoxAPI.isUserDataBoxNameAvailableForUserDataStorage(encryptedUserDataBoxNameAvailabilityRequest);
            if (IS_USER_DATA_BOX_NAME_AVAILABLE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
              appLogger.error("Could not get name availability.");
              // props.errorSchemaBuilder.setErrors("Could not get username availability.", "name");
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
              if (IS_USER_DATA_BOX_NAME_AVAILABLE_RESPONSE.data) {
                const USER_DATA_BOX_CONFIG_CREATE_DTO: IUserDataBoxConfigCreateDTO = userDataBoxConfigCreateInputToUserDataBoxConfigCreateDTO(
                  FORM_DATA,
                  appLogger
                );
                try {
                  const ENCRYPTED_USER_DATA_BOX_CONFIG_CREATE_DTO: IEncryptedData<IUserDataBoxConfigCreateDTO> =
                    await window.IPCTLSAPI.encrypt<IUserDataBoxConfigCreateDTO>(USER_DATA_BOX_CONFIG_CREATE_DTO, "User Data Box Config Create DTO");
                  const ADD_USER_DATA_BOX_CONFIG_RESPONSE: IPCAPIResponse<boolean> = window.userDataBoxAPI.addUserDataBoxConfig(
                    ENCRYPTED_USER_DATA_BOX_CONFIG_CREATE_DTO
                  );
                  if (ADD_USER_DATA_BOX_CONFIG_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
                    if (ADD_USER_DATA_BOX_CONFIG_RESPONSE.data) {
                      setFormData(undefined);
                      appLogger.debug("Added User Data Storage Box.");
                      enqueueSnackbar({ message: "Added data box.", variant: "success" });
                      props.onAddedSuccessfully();
                    } else {
                      appLogger.error("Could not add User Data Storage Box.");
                      enqueueSnackbar({ message: "Could not add data box.", variant: "error" });
                    }
                  } else {
                    appLogger.error("Error adding User Data Storage Box.");
                    enqueueSnackbar({ message: "Error adding data box.", variant: "error" });
                  }
                } catch (error: unknown) {
                  const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
                  appLogger.error(`Could not encrypt User Data Box Config Create DTO: ${ERROR_MESSAGE}.`);
                  enqueueSnackbar({ message: "Data box encryption error.", variant: "error" });
                }
              } else {
                appLogger.warn("User Data Box name not available.");
                // props.errorSchemaBuilder.setErrors(`Name "${FORM_DATA.name}" is not available.`, "name");
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
            appLogger.error(`Could not encrypt User Data Box name availability request. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Data box name availability request encryption error.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt User Data Box name availability request. Error: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Data box name availability request encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsAddUserDataBoxConfigPending(false);
        });
    },
    [props]
  );

  const handleFormOnChange = useCallback((data: IChangeEvent<IUserDataBoxConfigCreateInput>): void => {
    setFormData(data.formData);
  }, []);

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
      transformErrors={errorCapitalizerErrorTransformer}
      onSubmit={handleFormSubmit}
      // extraErrors={props.errorSchemaBuilder.ErrorSchema}
      extraErrors={toErrorSchema<IUserDataBoxConfigCreateInput>(props.extraErrors)}
      extraErrorsBlockSubmit={false}
      noHtml5Validate={true}
      formData={formData}
      onChange={handleFormOnChange}
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
