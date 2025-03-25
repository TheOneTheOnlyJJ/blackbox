import { Dispatch, FC, SetStateAction, useCallback, useMemo } from "react";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { ErrorTransformer, RJSFSchema, RJSFValidationError } from "@rjsf/utils";
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
import { IAppRootContext, useAppRootContext } from "../roots/appRoot/AppRootContext";

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

export interface INewUserDataStorageConfigFormProps {
  formRef: FormProps["ref"];
  userIdToAddTo: string;
  onAddedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isAddUserDataStorageConfigPending: boolean;
  setIsAddUserDataStorageConfigPending: Dispatch<SetStateAction<boolean>>;
}

const NewUserDataStorageConfigForm: FC<INewUserDataStorageConfigFormProps> = (props: INewUserDataStorageConfigFormProps) => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const { userIdToAddTo, onAddedSuccessfully } = props;

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
            const ADD_USER_DATA_STORAGE_CONFIG_RESPONSE: IPCAPIResponse<boolean> = window.userDataStorageConfigAPI.addUserDataStorageConfig(
              encryptedUserDataStorageConfigCreateDTO
            );
            if (ADD_USER_DATA_STORAGE_CONFIG_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
              if (ADD_USER_DATA_STORAGE_CONFIG_RESPONSE.data) {
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
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt User Data Storage Config Create DTO. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "User Data Storage Config encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsAddUserDataStorageConfigPending(false);
        });
    },
    [userIdToAddTo, onAddedSuccessfully, props]
  );

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
      noHtml5Validate={true}
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
