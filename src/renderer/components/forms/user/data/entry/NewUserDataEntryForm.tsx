import { Button } from "@mui/material";
import { ISelectedUserDataBoxIdFormContext } from "@renderer/components/forms/contexts/SelectedUserDataBoxIdFormContext";
import { ISelectedUserDataStorageIdFormContext } from "@renderer/components/forms/contexts/SelectedUserDataStorageIdFormContext";
import { ISignedInRootContext, useSignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import { IUserDataEntryCreateInput } from "@renderer/user/data/entry/create/input/UserDataEntryCreateInput";
import { getUserDataEntryCreateInputJSONSchemaFromTemplateInfo } from "@renderer/user/data/entry/create/input/utils/getUserDataEntryCreateInputJSONSchemaFromTemplateInfo";
import { getUserDataEntryCreateInputUISchemaFromTemplateInfo } from "@renderer/user/data/entry/create/input/utils/getUserDataEntryCreateInputUISchemaFromTemplateInfo";
import { userDataEntryCreateInputToUserDataEntryCreateDTO } from "@renderer/user/data/entry/create/input/utils/userDataEntryCreateInputToUserDataEntryCreateDTO";
import { appLogger } from "@renderer/utils/loggers";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { FormProps, IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { RJSFValidationError, RJSFSchema, toErrorSchema, UiSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";
import { IUserDataEntryCreateDTO } from "@shared/user/data/entry/create/DTO/UserDataEntryCreateDTO";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { JSONSchemaType } from "ajv";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, FC, useMemo, useCallback, useState } from "react";

type NewUserDataEntryFormContext = ISelectedUserDataStorageIdFormContext & ISelectedUserDataBoxIdFormContext;

const MUIForm = withTheme<IUserDataEntryCreateInput>(Theme);

const isValidUserDataEntryCreateInput = customizeValidator<IUserDataEntryCreateInput, RJSFSchema, NewUserDataEntryFormContext>();

export interface INewUserDataEntryFormProps {
  formRef: FormProps["ref"];
  templateInfo: IUserDataTemplateInfo;
  onAddedSuccessfully: () => void;
  renderSubmitButton: boolean;
  isAddUserDataEntryPending: boolean;
  setIsAddUserDataEntryPending: Dispatch<SetStateAction<boolean>>;
  extraErrors: RJSFValidationError[];
  setExtraErrors: Dispatch<SetStateAction<RJSFValidationError[]>>;
}

const NewUserDataEntryForm: FC<INewUserDataEntryFormProps> = (props: INewUserDataEntryFormProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const [formData, setFormData] = useState<IUserDataEntryCreateInput | undefined>(undefined);

  const formContext = useMemo<NewUserDataEntryFormContext>((): NewUserDataEntryFormContext => {
    return { selectedUserDataStorageId: formData?.storageId, selectedUserDataBoxId: formData?.boxId };
  }, [formData]);

  const userDataEntryJSONSchema: JSONSchemaType<IUserDataEntryCreateInput> = useMemo<
    JSONSchemaType<IUserDataEntryCreateInput>
  >((): JSONSchemaType<IUserDataEntryCreateInput> => {
    return getUserDataEntryCreateInputJSONSchemaFromTemplateInfo(props.templateInfo, null);
  }, [props.templateInfo]);

  const userDataEntryUISchema: UiSchema<IUserDataEntryCreateInput> = useMemo<
    UiSchema<IUserDataEntryCreateInput>
  >((): UiSchema<IUserDataEntryCreateInput> => {
    const STORAGE_NAME: string | undefined = signedInRootContext.getInitialisedUserDataStorageInfoById(props.templateInfo.storageId)?.name;
    if (STORAGE_NAME === undefined) {
      throw new Error(`Could not get User Data Storage name for User Data Storage ${props.templateInfo.storageId}`);
    }
    const BOX_NAME: string | undefined = signedInRootContext.getAvailableUserDataBoxInfoByIdentifier({
      storageId: props.templateInfo.storageId,
      boxId: props.templateInfo.boxId
    } satisfies IUserDataBoxIdentifier)?.name;
    if (BOX_NAME === undefined) {
      throw new Error(
        `Could not get User Data Box name for User Data Box ${props.templateInfo.boxId} from User Data Storage ${props.templateInfo.storageId}`
      );
    }
    return {
      ...getUserDataEntryCreateInputUISchemaFromTemplateInfo(props.templateInfo, BOX_NAME, STORAGE_NAME, null),
      "ui:submitButtonOptions": { norender: !props.renderSubmitButton }
    };
  }, [props.templateInfo, props.renderSubmitButton, signedInRootContext]);

  // TODO: Delete this
  // useEffect((): void => {
  //   appLogger.error(`FORM DATA CHANGED:\n${JSON.stringify(formData, null, 2)}`);
  // }, [formData]);

  const isSubmitButtonDisabled: boolean = useMemo<boolean>((): boolean => {
    // TODO: Check if this is all that's really needed?
    return props.isAddUserDataEntryPending;
  }, [props.isAddUserDataEntryPending]);

  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserDataEntryCreateInput>): void => {
      appLogger.info("Submitted new User Data Entry form.");
      if (props.isAddUserDataEntryPending) {
        appLogger.warn("Add User Data Entry pending. No-op form sumit.");
        return;
      }
      props.setIsAddUserDataEntryPending(true);
      props.setExtraErrors([]);
      if (data.formData === undefined) {
        appLogger.error("Undefined User Data Entry Create Input form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const USER_DATA_ENTRY_CREATE_DTO: IUserDataEntryCreateDTO = userDataEntryCreateInputToUserDataEntryCreateDTO(data.formData, appLogger);
      // TODO: DELETE THIS
      appLogger.warn(`USER DATA ENTRY CREATE DTO: ${JSON.stringify(USER_DATA_ENTRY_CREATE_DTO, null, 2)}`);
      window.IPCTLSAPI.encrypt<IUserDataEntryCreateDTO>(USER_DATA_ENTRY_CREATE_DTO, "User Data Entry Create DTO")
        .then(
          (encryptedUserDataEntryCreateDTO: IEncryptedData<IUserDataEntryCreateDTO>): void => {
            const ADD_USER_DATA_ENTRY_RESPONSE: IPCAPIResponse<boolean> = window.userDataEntryAPI.addUserDataEntry(encryptedUserDataEntryCreateDTO);
            if (ADD_USER_DATA_ENTRY_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
              if (ADD_USER_DATA_ENTRY_RESPONSE.data) {
                setFormData(undefined);
                appLogger.debug("Added User Data Entry.");
                enqueueSnackbar({ message: "Added data entry.", variant: "success" });
                props.onAddedSuccessfully();
              } else {
                appLogger.error("Could not add User Data Entry.");
                enqueueSnackbar({ message: "Could not add data entry.", variant: "error" });
              }
            } else {
              appLogger.error("Error adding User Data Entry.");
              enqueueSnackbar({ message: "Error adding data entry.", variant: "error" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt User Data Entry Create DTO. Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Data entry encryption error.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt User Data Entry Create DTO. Error: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Data entry encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsAddUserDataEntryPending(false);
        });
    },
    [props]
  );

  const handleFormOnChange = useCallback((data: IChangeEvent<IUserDataEntryCreateInput>): void => {
    setFormData(data.formData);
  }, []);

  return (
    <MUIForm
      ref={props.formRef}
      schema={userDataEntryJSONSchema as RJSFSchema}
      validator={isValidUserDataEntryCreateInput}
      uiSchema={userDataEntryUISchema}
      omitExtraData={true}
      liveOmit={true}
      showErrorList={false}
      transformErrors={errorCapitalizerErrorTransformer}
      onSubmit={handleFormSubmit}
      extraErrors={toErrorSchema<IUserDataEntryCreateInput>(props.extraErrors)}
      extraErrorsBlockSubmit={false}
      noHtml5Validate={true}
      formData={formData}
      onChange={handleFormOnChange}
      formContext={formContext}
    >
      {props.renderSubmitButton && (
        <Button type="submit" disabled={isSubmitButtonDisabled} variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
          {props.isAddUserDataEntryPending ? "Submitting..." : "Submit"}
        </Button>
      )}
    </MUIForm>
  );
};

export default NewUserDataEntryForm;
