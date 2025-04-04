import { Button } from "@mui/material";
import {
  IUserDataStorageVisibilityGroupConfigCreateInput,
  USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/storage/visibilityGroup/config/create/input/UserDataStorageVisibilityGroupConfigCreateInput";
import { userDataStorageVisibilityGroupConfigCreateInputToUserDataStorageVisibilityGroupConfigCreateDTO } from "@renderer/user/data/storage/visibilityGroup/config/create/input/utils/userDataStorageVisibilityGroupConfigCreateInputToUserDataStorageVisibilityGroupCreateDTO";
import { appLogger } from "@renderer/utils/loggers";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { CustomValidator, FormValidation, RJSFSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/constants";
import { IUserDataStorageVisibilityGroupConfigCreateDTO } from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { enqueueSnackbar } from "notistack";
import { Dispatch, FC, SetStateAction, useCallback, useMemo } from "react";
import { IAppRootContext, useAppRootContext } from "../roots/appRoot/AppRootContext";

const MUIForm = withTheme<IUserDataStorageVisibilityGroupConfigCreateInput>(Theme);

const USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_INPUT_VALIDATOR = customizeValidator<IUserDataStorageVisibilityGroupConfigCreateInput>();

const newUserDataStorageVisibilityGroupConfigFormValidator: CustomValidator<IUserDataStorageVisibilityGroupConfigCreateInput> = (
  formData: IUserDataStorageVisibilityGroupConfigCreateInput | undefined,
  errors: FormValidation<IUserDataStorageVisibilityGroupConfigCreateInput>
): FormValidation<IUserDataStorageVisibilityGroupConfigCreateInput> => {
  // Skip if no form data or errors
  if (formData === undefined || errors.name === undefined || errors.password === undefined || errors.confirmPassword === undefined) {
    return errors;
  }
  if (formData.name.toLowerCase() === PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name.toLowerCase()) {
    errors.name.addError('"Public" is a reserved Visibility Group name. Try something else.');
  } else {
    const IS_DATA_VISIBILITY_GROUP_NAME_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> =
      window.userDataStorageVisibilityGroupAPI.isUserDataStorageVisibilityGroupNameAvailableForSignedInUser(formData.name);
    if (IS_DATA_VISIBILITY_GROUP_NAME_AVAILABLE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      errors.name.addError("Could not get name availability.");
    } else {
      if (!IS_DATA_VISIBILITY_GROUP_NAME_AVAILABLE_RESPONSE.data) {
        errors.name.addError(`Name "${formData.name}" is not available.`);
      }
    }
  }
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword.addError("Does not match Password.");
  }
  return errors;
};

export interface INewUserDataStorageVisibilityGroupConfigFormProps {
  formRef: FormProps["ref"];
  userIdToAddTo: string;
  onAddedSuccessfully: () => void;
  onOpenedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isAddUserDataStorageVisibilityGroupConfigPending: boolean;
  setIsAddUserDataStorageVisibilityGroupConfigPending: Dispatch<SetStateAction<boolean>>;
}

const NewUserDataStorageVisibilityGroupConfigForm: FC<INewUserDataStorageVisibilityGroupConfigFormProps> = (
  props: INewUserDataStorageVisibilityGroupConfigFormProps
) => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const { userIdToAddTo, onAddedSuccessfully, onOpenedSuccessfully } = props;

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return props.isAddUserDataStorageVisibilityGroupConfigPending || appRootContext.userAccountStorageInfo === null
      ? true
      : !appRootContext.userAccountStorageInfo.backend.isOpen;
  }, [props.isAddUserDataStorageVisibilityGroupConfigPending, appRootContext.userAccountStorageInfo]);

  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataStorageVisibilityGroupConfigCreateInput>): void => {
      appLogger.info("Submitted new User Data Storage Visibility Group Config form.");
      if (props.isAddUserDataStorageVisibilityGroupConfigPending) {
        appLogger.warn("Add User Data Storage Visibility Group Config pending. No-op form sumit.");
        return;
      }
      props.setIsAddUserDataStorageVisibilityGroupConfigPending(true);
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Storage Visibility Group Config Create Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const DO_OPEN_AFTER_CREATING: boolean | undefined = data.formData.openAfterCreating;
      const USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_DTO: IUserDataStorageVisibilityGroupConfigCreateDTO =
        userDataStorageVisibilityGroupConfigCreateInputToUserDataStorageVisibilityGroupConfigCreateDTO(userIdToAddTo, data.formData, appLogger);
      window.IPCTLSAPI.encrypt<IUserDataStorageVisibilityGroupConfigCreateDTO>(
        USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_DTO,
        "User Data Storage Visibility Group Config Create DTO"
      )
        .then(
          async (
            encryptedUserDataStorageVisibilityGroupConfigCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupConfigCreateDTO>
          ): Promise<void> => {
            const ADD_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_RESPONSE: IPCAPIResponse<boolean> =
              window.userDataStorageVisibilityGroupAPI.addUserDataStorageVisibilityGroupConfig(
                encryptedUserDataStorageVisibilityGroupConfigCreateDTO
              );
            if (ADD_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
              if (ADD_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_RESPONSE.data) {
                enqueueSnackbar({ message: "Added data storage visibility group.", variant: "success" });
                onAddedSuccessfully();
                if (DO_OPEN_AFTER_CREATING === true) {
                  try {
                    const ENCRYPTED_USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_DTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO> =
                      await window.IPCTLSAPI.encrypt<IUserDataStorageVisibilityGroupsOpenRequestDTO>(
                        {
                          userIdToOpenFor: userIdToAddTo,
                          password: USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_DTO.password
                        } satisfies IUserDataStorageVisibilityGroupsOpenRequestDTO,
                        "newly created User Data Storage Visibility Group Open Request DTO"
                      );
                    const OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS_RESPONSE: IPCAPIResponse<number> =
                      window.userDataStorageVisibilityGroupAPI.openUserDataStorageVisibilityGroups(
                        ENCRYPTED_USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_DTO
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
                        enqueueSnackbar({ message: "No new data storage visibility group opened.", variant: "error" });
                      }
                    } else {
                      enqueueSnackbar({ message: "Error opening data storage visibility group.", variant: "error" });
                    }
                  } catch (error: unknown) {
                    const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
                    appLogger.error(`Could not open newly created User Data Storage Visibility Group. Reason: ${ERROR_MESSAGE}.`);
                    enqueueSnackbar({ message: "Data storage visibility group open error.", variant: "error" });
                  }
                }
              } else {
                enqueueSnackbar({ message: "Could not add data storage visibility group.", variant: "error" });
              }
            } else {
              enqueueSnackbar({ message: "Error adding data storage visibility group.", variant: "error" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt User Data Storage Visibility Group Config Create DTO. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Data storage visibility group encryption error.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt User Data Storage Visibility Group Config Create DTO. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Data storage visibility group encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsAddUserDataStorageVisibilityGroupConfigPending(false);
        });
    },
    [props, userIdToAddTo, onAddedSuccessfully, onOpenedSuccessfully]
  );

  return (
    <MUIForm
      ref={props.formRef}
      schema={USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_INPUT_JSON_SCHEMA as RJSFSchema}
      validator={USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_INPUT_VALIDATOR}
      uiSchema={{
        ...USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_INPUT_UI_SCHEMA,
        "ui:submitButtonOptions": { norender: !props.renderSubmitButton }
      }}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      customValidate={newUserDataStorageVisibilityGroupConfigFormValidator}
      transformErrors={errorCapitalizerErrorTransformer}
      onSubmit={handleFormSubmit}
      noHtml5Validate={true}
    >
      {props.renderSubmitButton && (
        <Button type="submit" disabled={isSubmitButtonDisabled} variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
          {props.isAddUserDataStorageVisibilityGroupConfigPending ? "Submitting..." : "Submit"}
        </Button>
      )}
    </MUIForm>
  );
};

export default NewUserDataStorageVisibilityGroupConfigForm;
