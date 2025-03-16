import { Button } from "@mui/material";
import {
  IUserDataStorageVisibilityGroupCreateInput,
  USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/visibilityGroup/create/input/UserDataStorageVisibilityGroupCreateInput";
import { userDataStorageVisibilityGroupCreateInputToUserDataStorageVisibilityGroupCreateDTO } from "@renderer/user/data/visibilityGroup/create/input/utils/userDataStorageVisibilityGroupCreateInputToUserDataStorageVisibilityGroupCreateDTO";
import { appLogger } from "@renderer/utils/loggers";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { CustomValidator, FormValidation, RJSFSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/constants";
import { IUserDataStorageVisibilityGroupCreateDTO } from "@shared/user/data/storage/visibilityGroup/create/DTO/UserDataStorageVisibilityGroupCreateDTO";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { enqueueSnackbar } from "notistack";
import { Dispatch, FC, SetStateAction, useCallback } from "react";

const MUIForm = withTheme<IUserDataStorageVisibilityGroupCreateInput>(Theme);

const USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_INPUT_VALIDATOR = customizeValidator<IUserDataStorageVisibilityGroupCreateInput>();

const newUserDataStorageVisibilityGroupFormValidator: CustomValidator<IUserDataStorageVisibilityGroupCreateInput> = (
  formData: IUserDataStorageVisibilityGroupCreateInput | undefined,
  errors: FormValidation<IUserDataStorageVisibilityGroupCreateInput>
): FormValidation<IUserDataStorageVisibilityGroupCreateInput> => {
  // Skip if no form data or errors
  if (formData === undefined || errors.name === undefined || errors.password === undefined || errors.confirmPassword === undefined) {
    return errors;
  }
  if (formData.name.toLowerCase() === PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name.toLowerCase()) {
    errors.name.addError('"Public" is a reserved Visibility Group name. Try something else.');
  } else {
    const IS_DATA_VISIBILITY_GROUP_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> =
      window.userAPI.isUserDataStorageVisibilityGroupNameAvailableForSignedInUser(formData.name);
    if (IS_DATA_VISIBILITY_GROUP_AVAILABLE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      errors.name.addError("Could not get name availability.");
    } else {
      if (!IS_DATA_VISIBILITY_GROUP_AVAILABLE_RESPONSE.data) {
        errors.name.addError(`Name "${formData.name}" is not available.`);
      }
    }
  }
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword.addError("Does not match Password.");
  }
  return errors;
};

export interface INewUserDataStorageVisibilityGroupFormProps {
  formRef: FormProps["ref"];
  userIdToAddTo: string;
  onAddedSuccessfully: () => void;
  onOpenedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isAddUserDataStorageVisibilityGroupPending: boolean;
  setIsAddUserDataStorageVisibilityGroupPending: Dispatch<SetStateAction<boolean>>;
}

const NewUserDataStorageVisibilityGroupForm: FC<INewUserDataStorageVisibilityGroupFormProps> = (
  props: INewUserDataStorageVisibilityGroupFormProps
) => {
  const { userIdToAddTo, onAddedSuccessfully, onOpenedSuccessfully } = props;

  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataStorageVisibilityGroupCreateInput>): void => {
      appLogger.info("Submitted new User Data Storage Visibility Group form.");
      if (props.isAddUserDataStorageVisibilityGroupPending) {
        appLogger.warn("Add User Data Storage Visibility Group pending. No-op form sumit.");
        return;
      }
      props.setIsAddUserDataStorageVisibilityGroupPending(true);
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Storage Visibility Group Create Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const DO_OPEN_AFTER_CREATING: boolean | undefined = data.formData.openAfterCreating;
      const USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_DTO: IUserDataStorageVisibilityGroupCreateDTO =
        userDataStorageVisibilityGroupCreateInputToUserDataStorageVisibilityGroupCreateDTO(userIdToAddTo, data.formData, appLogger);
      window.IPCTLSAPI.encrypt<IUserDataStorageVisibilityGroupCreateDTO>(
        USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_DTO,
        "User Data Storage Visibility Group Create DTO"
      )
        .then(
          async (encryptedUserDataStorageVisibilityGroupCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupCreateDTO>): Promise<void> => {
            const ADD_USER_DATA_STORAGE_VISIBILITY_GROUP_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.addUserDataStorageVisibilityGroup(
              encryptedUserDataStorageVisibilityGroupCreateDTO
            );
            if (ADD_USER_DATA_STORAGE_VISIBILITY_GROUP_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
              if (ADD_USER_DATA_STORAGE_VISIBILITY_GROUP_RESPONSE.data) {
                enqueueSnackbar({ message: "Added data storage visibility group.", variant: "success" });
                onAddedSuccessfully();
                if (DO_OPEN_AFTER_CREATING === true) {
                  try {
                    const ENCRYPTED_USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_DTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO> =
                      await window.IPCTLSAPI.encrypt<IUserDataStorageVisibilityGroupsOpenRequestDTO>(
                        {
                          userIdToOpenFor: userIdToAddTo,
                          password: USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_DTO.password
                        } satisfies IUserDataStorageVisibilityGroupsOpenRequestDTO,
                        "newly created User Data Storage Visibility Group Open Request DTO"
                      );
                    const OPEN_USER_DATA_STORAGE_VISIBILITY_GROUPS_RESPONSE: IPCAPIResponse<number> =
                      window.userAPI.openUserDataStorageVisibilityGroups(ENCRYPTED_USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_DTO);
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
            appLogger.error(`Could not encrypt User Data Storage Visibility Group Create DTO. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Data storage visibility group encryption error.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt User Data Storage Visibility Group Create DTO. Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Data storage visibility group encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsAddUserDataStorageVisibilityGroupPending(false);
        });
    },
    [props, userIdToAddTo, onAddedSuccessfully, onOpenedSuccessfully]
  );

  return (
    <MUIForm
      ref={props.formRef}
      schema={USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_INPUT_JSON_SCHEMA as RJSFSchema}
      validator={USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_INPUT_VALIDATOR}
      uiSchema={{ ...USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_INPUT_UI_SCHEMA, "ui:submitButtonOptions": { norender: !props.renderSubmitButton } }}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      customValidate={newUserDataStorageVisibilityGroupFormValidator}
      transformErrors={errorCapitalizerErrorTransformer}
      onSubmit={handleFormSubmit}
      noHtml5Validate={true}
    >
      {props.renderSubmitButton && (
        <Button
          type="submit"
          disabled={props.isAddUserDataStorageVisibilityGroupPending}
          variant="contained"
          size="large"
          sx={{ marginTop: "1vw", marginBottom: "1vw" }}
        >
          {props.isAddUserDataStorageVisibilityGroupPending ? "Submitting..." : "Submit"}
        </Button>
      )}
    </MUIForm>
  );
};

export default NewUserDataStorageVisibilityGroupForm;
