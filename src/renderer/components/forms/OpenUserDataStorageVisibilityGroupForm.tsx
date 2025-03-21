import { Button } from "@mui/material";
import {
  IUserDataStorageVisibilityGroupOpenRequestInput,
  USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_INPUT_JSON_SCHEMA,
  USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_INPUT_UI_SCHEMA
} from "@renderer/user/data/visibilityGroup/openRequest/input/UserDataStorageVisibilityGroupOpenRequestInput";
import { userDataStorageVisibilityGroupOpenRequestInputToUserDataStorageVisibilityGroupOpenRequestDTO } from "@renderer/user/data/visibilityGroup/openRequest/input/utils/userDataStorageVisibilityGroupOpenRequestInputToUserDataStorageVisibilityGroupOpenRequestDTO";
import { appLogger } from "@renderer/utils/loggers";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { CustomValidator, ErrorTransformer, FormValidation, RJSFSchema, RJSFValidationError } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { enqueueSnackbar } from "notistack";
import { Dispatch, FC, SetStateAction, useCallback, useMemo } from "react";
import { IAppRootContext, useAppRootContext } from "../roots/appRoot/AppRootContext";

const MUIForm = withTheme<IUserDataStorageVisibilityGroupOpenRequestInput>(Theme);

const USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_INPUT_VALIDATOR = customizeValidator<IUserDataStorageVisibilityGroupOpenRequestInput>();

const openUserDataStorageVisibilityGroupFormErrorTransformer: ErrorTransformer = (errors: RJSFValidationError[]): RJSFValidationError[] => {
  return errorCapitalizerErrorTransformer(
    errors.map((error: RJSFValidationError) => {
      if (error.name === "required" && error.property !== undefined) {
        if (error.property === "confirmPassword") {
          error.message = "Must confirm Password";
        } else {
          // TODO: Extract title from error: https://github.com/rjsf-team/react-jsonschema-form/issues/4504
          error.message = `Must provide ${error.property.charAt(0).toUpperCase()}${error.property.slice(1)}`;
        }
      }
      return error;
    })
  );
};

const openUserDataStorageVisibilityGroupFormValidator: CustomValidator<IUserDataStorageVisibilityGroupOpenRequestInput> = (
  formData: IUserDataStorageVisibilityGroupOpenRequestInput | undefined,
  errors: FormValidation<IUserDataStorageVisibilityGroupOpenRequestInput>
): FormValidation<IUserDataStorageVisibilityGroupOpenRequestInput> => {
  // Skip if no form data or errors
  if (formData === undefined || errors.password === undefined || errors.confirmPassword === undefined) {
    return errors;
  }
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword.addError("Does not match Password.");
  }
  return errors;
};

export interface IOpenUserDataStorageVisibilityGroupFormProps {
  formRef: FormProps["ref"];
  userIdToOpenFor: string;
  onOpenedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isOpenUserDataStorageVisibilityGroupPending: boolean;
  setIsOpenUserDataStorageVisibilityGroupPending: Dispatch<SetStateAction<boolean>>;
}

const OpenUserDataStorageVisibilityGroupForm: FC<IOpenUserDataStorageVisibilityGroupFormProps> = (
  props: IOpenUserDataStorageVisibilityGroupFormProps
) => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const { userIdToOpenFor, onOpenedSuccessfully } = props;

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return props.isOpenUserDataStorageVisibilityGroupPending || appRootContext.userAccountStorageInfo === null
      ? true
      : !appRootContext.userAccountStorageInfo.backend.isOpen;
  }, [props.isOpenUserDataStorageVisibilityGroupPending, appRootContext.userAccountStorageInfo]);

  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataStorageVisibilityGroupOpenRequestInput>): void => {
      appLogger.info("Submitted open User Data Storage Visibility Group form.");
      if (props.isOpenUserDataStorageVisibilityGroupPending) {
        appLogger.warn("Open User Data Storage Visibility Group pending. No-op form sumit.");
        return;
      }
      props.setIsOpenUserDataStorageVisibilityGroupPending(true);
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Storage Visibility Group Open Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_DTO: IUserDataStorageVisibilityGroupsOpenRequestDTO =
        userDataStorageVisibilityGroupOpenRequestInputToUserDataStorageVisibilityGroupOpenRequestDTO(userIdToOpenFor, data.formData, appLogger);
      window.IPCTLSAPI.encrypt<IUserDataStorageVisibilityGroupsOpenRequestDTO>(
        USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_DTO,
        "User Data Storage Visibility Group Open Request DTO"
      )
        .then(
          (encryptedUserDataStorageVisibilityGroupOpenRequestDTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO>): void => {
            const OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS_RESPONSE: IPCAPIResponse<number> = window.userAPI.openUserDataStorageVisibilityGroups(
              encryptedUserDataStorageVisibilityGroupOpenRequestDTO
            );
            if (OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
              if (OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS_RESPONSE.data > 0) {
                enqueueSnackbar({
                  message: `Opened ${
                    OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS_RESPONSE.data === 1
                      ? "a"
                      : OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS_RESPONSE.data.toString()
                  } new data storage visibility group${OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS_RESPONSE.data === 1 ? "" : "s"}.`,
                  variant: "info"
                });
                onOpenedSuccessfully();
              } else {
                enqueueSnackbar({ message: "No new data storage visibility group opened.", variant: "info" });
              }
            } else {
              enqueueSnackbar({ message: "Error opening data storage visibility group.", variant: "error" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt User Data Storage Visibility Group Open DTO. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Data storage visibility group password encryption error.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt User Data Storage Visibility Group Create DTO. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Data storage visibility group encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsOpenUserDataStorageVisibilityGroupPending(false);
        });
    },
    [userIdToOpenFor, onOpenedSuccessfully, props]
  );

  return (
    <MUIForm
      ref={props.formRef}
      schema={USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_INPUT_JSON_SCHEMA as RJSFSchema}
      validator={USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_INPUT_VALIDATOR}
      uiSchema={{
        ...USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_INPUT_UI_SCHEMA,
        "ui:submitButtonOptions": { norender: !props.renderSubmitButton }
      }}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      customValidate={openUserDataStorageVisibilityGroupFormValidator}
      transformErrors={openUserDataStorageVisibilityGroupFormErrorTransformer}
      onSubmit={handleFormSubmit}
      noHtml5Validate={true}
    >
      {props.renderSubmitButton && (
        <Button type="submit" disabled={isSubmitButtonDisabled} variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
          {props.isOpenUserDataStorageVisibilityGroupPending ? "Opening..." : "Open"}
        </Button>
      )}
    </MUIForm>
  );
};

export default OpenUserDataStorageVisibilityGroupForm;
