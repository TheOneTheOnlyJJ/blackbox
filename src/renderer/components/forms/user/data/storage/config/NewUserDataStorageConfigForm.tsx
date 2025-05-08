import { Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from "react";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { ErrorTransformer, RJSFSchema, RJSFValidationError, toErrorSchema } from "@rjsf/utils";
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
import Button from "@mui/material/Button/Button";
import { IAppRootContext, useAppRootContext } from "../../../../../roots/appRoot/AppRootContext";
import { IUserDataStorageNameAvailabilityRequest } from "@shared/user/data/storage/config/create/UserDataStorageNameAvailabilityRequest";

const MUIForm = withTheme<IUserDataStorageConfigCreateInput>(Theme);

// TODO: Rename all of these to isValid....
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

export interface INewUserDataStorageConfigFormProps {
  formRef: FormProps["ref"];
  userIdToAddTo: string;
  onAddedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isAddUserDataStorageConfigPending: boolean;
  setIsAddUserDataStorageConfigPending: Dispatch<SetStateAction<boolean>>;
  extraErrors: RJSFValidationError[];
  setExtraErrors: Dispatch<SetStateAction<RJSFValidationError[]>>;
}

const NewUserDataStorageConfigForm: FC<INewUserDataStorageConfigFormProps> = (props: INewUserDataStorageConfigFormProps) => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const { userIdToAddTo, onAddedSuccessfully } = props;
  const [formData, setFormData] = useState<IUserDataStorageConfigCreateInput | undefined>(undefined);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return props.isAddUserDataStorageConfigPending || appRootContext.userAccountStorageInfo === null
      ? true
      : !appRootContext.userAccountStorageInfo.backend.isOpen;
  }, [props.isAddUserDataStorageConfigPending, appRootContext.userAccountStorageInfo]);

  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataStorageConfigCreateInput>): void => {
      appLogger.info("Submitted new User Data Storage Config form.");
      if (props.isAddUserDataStorageConfigPending) {
        appLogger.warn("Add User Data Storage Config pending. No-op form sumit.");
        return;
      }
      props.setIsAddUserDataStorageConfigPending(true);
      props.setExtraErrors([]);
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Storage Config Create Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const FORM_DATA: IUserDataStorageConfigCreateInput = data.formData;
      // TODO: Add a new UserDataStorageResourceAvailabilityRequest that checks for existing files with the same name for Local SQLite Data Storages
      // TODO: So that an existing database with the input data name is not overwritten
      // TODO: Maybe rename all NameAvailabilityRequest to ResourceAvailabilityRequest
      // TODO: OR maybe include all of this logic in the addNewX and add errors here dynamically; NO, validation should be an intentional separate step with its own API surface
      window.IPCTLSAPI.encrypt<IUserDataStorageNameAvailabilityRequest>(
        {
          name: FORM_DATA.name,
          visibilityGroupId: FORM_DATA.visibilityGroupId ?? null
        } satisfies IUserDataStorageNameAvailabilityRequest,
        "User Data Storage name availability request"
      )
        .then(
          async (encryptedUserDataStorageNameAvailabilityRequest: IEncryptedData<IUserDataStorageNameAvailabilityRequest>): Promise<void> => {
            const IS_USER_DATA_STORAGE_NAME_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> = window.userDataStorageAPI.isUserDataStorageNameAvailable(
              encryptedUserDataStorageNameAvailabilityRequest
            );
            if (IS_USER_DATA_STORAGE_NAME_AVAILABLE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
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
              if (IS_USER_DATA_STORAGE_NAME_AVAILABLE_RESPONSE.data) {
                const USER_DATA_STORAGE_CONFIG_CREATE_DTO: IUserDataStorageConfigCreateDTO =
                  userDataStorageConfigCreateInputToUserDataStorageConfigCreateDTO(userIdToAddTo, FORM_DATA, appLogger);
                try {
                  const ENCRYPTED_USER_DATA_STORAGE_CONFIG_CREATE_DTO: IEncryptedData<IUserDataStorageConfigCreateDTO> =
                    await window.IPCTLSAPI.encrypt<IUserDataStorageConfigCreateDTO>(
                      USER_DATA_STORAGE_CONFIG_CREATE_DTO,
                      "User Data Storage Config Create DTO"
                    );
                  const ADD_USER_DATA_STORAGE_CONFIG_RESPONSE: IPCAPIResponse<boolean> = window.userDataStorageConfigAPI.addUserDataStorageConfig(
                    ENCRYPTED_USER_DATA_STORAGE_CONFIG_CREATE_DTO
                  );
                  if (ADD_USER_DATA_STORAGE_CONFIG_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
                    if (ADD_USER_DATA_STORAGE_CONFIG_RESPONSE.data) {
                      setFormData(undefined);
                      appLogger.debug("Added User Data Storage Config.");
                      enqueueSnackbar({ message: "Added User Data Storage Config.", variant: "success" });
                      onAddedSuccessfully();
                    } else {
                      appLogger.error("Could not add User Data Storage Config.");
                      enqueueSnackbar({ message: "Could not add User Data Storage Config.", variant: "error" });
                    }
                  } else {
                    appLogger.error("Error adding User Data Storage Config.");
                    enqueueSnackbar({ message: "Error adding User Data Storage Config.", variant: "error" });
                  }
                } catch (error: unknown) {
                  const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
                  appLogger.error(`Could not encrypt User Data Storage Config Create DTO. Error: ${ERROR_MESSAGE}.`);
                  enqueueSnackbar({ message: "User Data Storage Config encryption error.", variant: "error" });
                }
              } else {
                appLogger.warn("User Data Storage name not available.");
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
            appLogger.error(`Could not encrypt User Data Storage name availability request. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Data storage name availability request encryption error.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt User Data Box name availability request. Error: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Data box name availability request encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsAddUserDataStorageConfigPending(false);
        });
    },
    [userIdToAddTo, onAddedSuccessfully, props]
  );

  const handleFormOnChange = useCallback((data: IChangeEvent<IUserDataStorageConfigCreateInput>): void => {
    setFormData(data.formData);
  }, []);

  return (
    <MUIForm
      ref={props.formRef}
      schema={USER_DATA_STORAGE_CONFIG_CREATE_INPUT_JSON_SCHEMA as RJSFSchema}
      validator={USER_DATA_STORAGE_CONFIG_CREATE_INPUT_VALIDATOR}
      uiSchema={{ ...USER_DATA_STORAGE_CONFIG_CREATE_INPUT_UI_SCHEMA, "ui:submitButtonOptions": { norender: !props.renderSubmitButton } }}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      // customValidate={newUserDataStorageConfigFormValidator}
      transformErrors={newUserDataStorageConfigFormErrorTransformer}
      onSubmit={handleFormSubmit}
      extraErrors={toErrorSchema<IUserDataStorageConfigCreateInput>(props.extraErrors)}
      extraErrorsBlockSubmit={false}
      noHtml5Validate={true}
      formData={formData}
      onChange={handleFormOnChange}
    >
      {props.renderSubmitButton && (
        <Button type="submit" disabled={isSubmitButtonDisabled} variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
          {props.isAddUserDataStorageConfigPending ? "Submitting..." : "Submit"}
        </Button>
      )}
    </MUIForm>
  );
};

export default NewUserDataStorageConfigForm;
