import { Dispatch, FC, SetStateAction, useCallback, useMemo, useState } from "react";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { ErrorTransformer, RJSFSchema, RJSFValidationError } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import Button from "@mui/material/Button/Button";
import { appLogger } from "@renderer/utils/loggers";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";
import { enqueueSnackbar } from "notistack";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { IUserSignInInput, USER_SIGN_IN_INPUT_JSON_SCHEMA, USER_SIGN_IN_INPUT_UI_SCHEMA } from "@renderer/user/account/UserSignInInput";
import { userSignInInputToUserSignInDTO } from "@renderer/user/account/utils/userSignInInputToUserSignInDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IAppRootContext, useAppRootContext } from "../../../roots/appRoot/AppRootContext";

const MUIForm = withTheme<IUserSignInInput>(Theme);

const USER_SIGN_IN_INPUT_VALIDATOR = customizeValidator<IUserSignInInput>();

const userSignInFormErrorTransformer: ErrorTransformer = (errors: RJSFValidationError[]): RJSFValidationError[] => {
  return errorCapitalizerErrorTransformer(
    errors.map((error: RJSFValidationError) => {
      if (error.name === "required" && error.property !== undefined) {
        error.message = `Must provide ${error.property.charAt(0).toUpperCase()}${error.property.slice(1)}`;
      }
      return error;
    })
  );
};

export interface IUserSignInFormProps {
  isSignInPending: boolean;
  setIsSignInPending: Dispatch<SetStateAction<boolean>>;
  renderSubmitButton: boolean;
}

const UserSignInForm: FC<IUserSignInFormProps> = (props: IUserSignInFormProps) => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const [wasSignInSuccessful, setWasSignInSuccessful] = useState<boolean>(true);

  const isSubmitButtonDisabled = useMemo<boolean>((): boolean => {
    return props.isSignInPending || appRootContext.userAccountStorageInfo === null ? true : !appRootContext.userAccountStorageInfo.backend.isOpen;
  }, [props.isSignInPending, appRootContext.userAccountStorageInfo]);

  const handleFormSubmit = useCallback(
    (data: IChangeEvent<IUserSignInInput>): void => {
      appLogger.info("Submitted user Sign In form.");
      if (props.isSignInPending) {
        appLogger.warn("Sign in pending. No-op form sumit.");
        return;
      }
      props.setIsSignInPending(true);
      if (data.formData === undefined) {
        appLogger.error("Undefined sign in form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      const USERNAME: string = data.formData.username;
      window.IPCTLSAPI.encrypt<IUserSignInDTO>(userSignInInputToUserSignInDTO(data.formData, appLogger), "user sign in DTO")
        .then(
          (encryptedUserSignInDTO: IEncryptedData<IUserSignInDTO>): void => {
            const SIGN_IN_RESPONSE: IPCAPIResponse<boolean> = window.userAuthAPI.signIn(encryptedUserSignInDTO);
            if (SIGN_IN_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
              setWasSignInSuccessful(SIGN_IN_RESPONSE.data);
              if (SIGN_IN_RESPONSE.data) {
                appLogger.info(`Sign in successful.`);
                enqueueSnackbar({ message: `${USERNAME} signed in.`, variant: "info" });
              } else {
                appLogger.info(`Sign in unsuccessful.`);
              }
            } else {
              appLogger.error("Sign in error!");
              enqueueSnackbar({ message: "Sign in error.", variant: "error" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt user sign in DTO for user "${USERNAME}". Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
          }
        )
        .catch((error: unknown): void => {
          const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
          appLogger.error(`Could not encrypt user sign in DTO for user "${USERNAME}". Reason: ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
        })
        .finally((): void => {
          props.setIsSignInPending(false);
        });
    },
    [props]
  );

  return (
    <MUIForm
      schema={USER_SIGN_IN_INPUT_JSON_SCHEMA as RJSFSchema}
      uiSchema={{ ...USER_SIGN_IN_INPUT_UI_SCHEMA, "ui:submitButtonOptions": { norender: !props.renderSubmitButton } }}
      validator={USER_SIGN_IN_INPUT_VALIDATOR}
      showErrorList={false}
      transformErrors={userSignInFormErrorTransformer}
      onSubmit={handleFormSubmit}
      noHtml5Validate={true}
    >
      {!wasSignInSuccessful && (
        <Alert severity="error" sx={{ marginTop: "1em" }}>
          <AlertTitle>Invalid credentials!</AlertTitle>
          The username or password you entered are incorrect!
        </Alert>
      )}
      {props.renderSubmitButton && (
        <Button type="submit" disabled={isSubmitButtonDisabled} variant="contained" size="large" sx={{ marginTop: "1em", marginBottom: "1em" }}>
          {props.isSignInPending ? "Signing In..." : "Sign In"}
        </Button>
      )}
    </MUIForm>
  );
};

export default UserSignInForm;
