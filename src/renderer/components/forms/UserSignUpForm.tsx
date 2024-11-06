import { FC, useCallback, useState } from "react";
import { IAppRootContext, useAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { IBaseNewUserData } from "@shared/user/BaseNewUserData";
import { INewUserInputData, NEW_USER_INPUT_DATA_JSON_SCHEMA } from "@shared/user/NewUserInputData";
import { Theme } from "@rjsf/mui";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { withTheme, IChangeEvent } from "@rjsf/core";
import { CustomValidator, FormValidation, RJSFSchema } from "@rjsf/utils";
import { appLogger } from "@renderer/utils/loggers";
import { encrypt } from "@renderer/utils/encryption/encrypt";
import { IEncryptedBaseNewUserData } from "@shared/user/encrypted/EncryptedBaseNewUserData";
import SuccessfulUserRegistrationDialog, { ISuccessfulUserSignUpDialogProps } from "@renderer/components/dialogs/SuccessfulUserSignUpDialog";
import Button from "@mui/material/Button/Button";
import { IUserSignInCredentials } from "@shared/user/UserSignInCredentials";
import { IEncryptedUserSignInCredentials } from "@shared/user/encrypted/EncryptedUserSignInCredentials";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPCAPIResponseStatus } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import { errorCapitalizerTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerTransformer";
import { NEW_USER_INPUT_DATA_UI_SCHEMA } from "@renderer/user/account/uiSchemas/NewUserInputDataUiSchema";

const MUIForm = withTheme<INewUserInputData>(Theme);

const USER_SIGN_UP_FORM_VALIDATOR = customizeValidator<INewUserInputData>();

const userSignUpFormCustomValidate: CustomValidator<INewUserInputData> = (
  formData: INewUserInputData | undefined,
  errors: FormValidation<INewUserInputData>
): FormValidation<INewUserInputData> => {
  // Skip if no form data or errors
  if (formData === undefined || errors.username === undefined || errors.confirmPassword === undefined) {
    return errors;
  }
  const IS_USERNAME_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.isUsernameAvailable(formData.username);
  if (IS_USERNAME_AVAILABLE_RESPONSE.status !== IPCAPIResponseStatus.SUCCESS) {
    errors.username.addError("Could not get username availability.");
  } else {
    if (!IS_USERNAME_AVAILABLE_RESPONSE.data) {
      errors.username.addError("This username is not available.");
    }
  }
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword.addError("Does not match password.");
  }
  return errors;
};

const UserSignUpForm: FC = () => {
  const appRootContext: IAppRootContext = useAppRootContext();
  const [successfulUserSignUpDialogProps, setSuccessfulUserSignUpDialogProps] = useState<ISuccessfulUserSignUpDialogProps>({
    open: false,
    username: "",
    userCount: null,
    encryptedNewUserSignInCredentials: null
  });
  const signUpUser = useCallback(
    (data: IChangeEvent<INewUserInputData>): void => {
      appLogger.debug("Submitted user sign up form.");
      if (data.formData === undefined) {
        appLogger.error("Undefined sign up form data. No-op.");
        enqueueSnackbar({ message: "Missing form data.", variant: "error" });
        return;
      }
      if (appRootContext.rendererProcessAESKey === null) {
        appLogger.error("Null AES encryption key. Cannot encrypt base new user data. No-op.");
        enqueueSnackbar({ message: "Missing encryption key.", variant: "error" });
        return;
      }
      // Extract base new user data from form
      const BASE_NEW_USER_DATA: IBaseNewUserData = {
        username: data.formData.username,
        password: data.formData.password
      };
      appLogger.debug(`Encrypting base new user data for new user "${BASE_NEW_USER_DATA.username}".`);
      encrypt(JSON.stringify(BASE_NEW_USER_DATA), appRootContext.rendererProcessAESKey)
        .then(
          (encryptedBaseNewUserData: IEncryptedBaseNewUserData): void => {
            appLogger.debug("Done encrypting base new user data.");
            const SIGN_UP_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.signUp(encryptedBaseNewUserData);
            if (SIGN_UP_RESPONSE.status !== IPCAPIResponseStatus.SUCCESS) {
              enqueueSnackbar({ message: "Sign up error.", variant: "error" });
              return;
            }
            if (SIGN_UP_RESPONSE.data) {
              appLogger.info(`Sign up successful for new user "${BASE_NEW_USER_DATA.username}".`);
              if (appRootContext.rendererProcessAESKey === null) {
                appLogger.debug("Null AES encryption key. Cannot encrypt new user sign in credentials. No-op.");
                enqueueSnackbar({ message: "Missing encryption key.", variant: "error" });
                return;
              }
              // Extract sign in credentials from base new user data
              const NEW_USER_SIGN_IN_CREDENTIALS: IUserSignInCredentials = {
                username: BASE_NEW_USER_DATA.username,
                password: BASE_NEW_USER_DATA.password
              };
              let encryptedUserSignInCredentials: IEncryptedUserSignInCredentials | null = null;
              appLogger.debug(`Encrypting new user sign in credentials for new user "${NEW_USER_SIGN_IN_CREDENTIALS.username}".`);
              encrypt(JSON.stringify(NEW_USER_SIGN_IN_CREDENTIALS), appRootContext.rendererProcessAESKey)
                .then(
                  (encryptedNewUserSignInCredentials: IEncryptedUserSignInCredentials): void => {
                    appLogger.debug("Done encrypting new user sign in credentials.");
                    encryptedUserSignInCredentials = encryptedNewUserSignInCredentials;
                  },
                  (reason: unknown): void => {
                    const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
                    appLogger.error(
                      `Could not encrypt new user sign in credentials for new user "${BASE_NEW_USER_DATA.username}". Reason: ${REASON_MESSAGE}.`
                    );
                    encryptedUserSignInCredentials = null;
                    enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
                  }
                )
                .catch((err: unknown): void => {
                  const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
                  appLogger.error(`Could not encrypt new user sign in credentials for new user "${BASE_NEW_USER_DATA.username}". ${ERROR_MESSAGE}.`);
                  encryptedUserSignInCredentials = null;
                  enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
                })
                .finally((): void => {
                  appLogger.debug("Opening successful user sign up dialog.");
                  let userCount: number | null = null;
                  const GET_USER_COUNT_RESPONSE: IPCAPIResponse<number> = window.userAPI.getUserCount();
                  if (GET_USER_COUNT_RESPONSE.status === IPCAPIResponseStatus.SUCCESS) {
                    userCount = GET_USER_COUNT_RESPONSE.data;
                  }
                  setSuccessfulUserSignUpDialogProps({
                    open: true,
                    username: BASE_NEW_USER_DATA.username,
                    userCount: userCount,
                    encryptedNewUserSignInCredentials: encryptedUserSignInCredentials
                  });
                  enqueueSnackbar({ message: "Signed up." });
                });
            } else {
              appLogger.info(`Could not signup new user "${BASE_NEW_USER_DATA.username}".`);
              enqueueSnackbar({ message: "Sign up error.", variant: "error" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt base new user data for new user "${BASE_NEW_USER_DATA.username}". Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Account data encryption error.", variant: "error" });
          }
        )
        .catch((err: unknown): void => {
          const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
          appLogger.error(`Could not encrypt base new user data for new user "${BASE_NEW_USER_DATA.username}". ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Account data encryption error.", variant: "error" });
        });
    },
    [appRootContext.rendererProcessAESKey]
  );

  return (
    <>
      <MUIForm
        schema={NEW_USER_INPUT_DATA_JSON_SCHEMA as RJSFSchema}
        uiSchema={NEW_USER_INPUT_DATA_UI_SCHEMA}
        validator={USER_SIGN_UP_FORM_VALIDATOR}
        showErrorList={false}
        customValidate={userSignUpFormCustomValidate}
        transformErrors={errorCapitalizerTransformer}
        onSubmit={signUpUser}
      >
        <Button type="submit" variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
          Sign Up
        </Button>
      </MUIForm>
      <SuccessfulUserRegistrationDialog {...successfulUserSignUpDialogProps} />
    </>
  );
};

export default UserSignUpForm;
