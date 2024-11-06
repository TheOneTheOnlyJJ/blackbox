import { FC, useCallback, useState } from "react";
import { IAppRootContext, useAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { IUserSignUpData } from "@shared/user/account/UserSignUpData";
import { IUserSignUpInputData, USER_SIGN_UP_INPUT_DATA_JSON_SCHEMA } from "@renderer/user/account/inputData/UserSignUpInputData";
import { Theme } from "@rjsf/mui";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { withTheme, IChangeEvent } from "@rjsf/core";
import { CustomValidator, FormValidation, RJSFSchema } from "@rjsf/utils";
import { appLogger } from "@renderer/utils/loggers";
import { encrypt } from "@renderer/utils/encryption/encrypt";
import { IEncryptedUserSignUpData } from "@shared/user/account/encrypted/EncryptedUserSignUpData";
import SuccessfulUserRegistrationDialog, { ISuccessfulUserSignUpDialogProps } from "@renderer/components/dialogs/SuccessfulUserSignUpDialog";
import Button from "@mui/material/Button/Button";
import { IUserSignInData } from "@shared/user/account/UserSignInData";
import { IEncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import { errorCapitalizerTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerTransformer";
import { USER_SIGN_UP_INPUT_DATA_UI_SCHEMA } from "@renderer/user/account/uiSchemas/UserSignUpInputDataUiSchema";

const MUIForm = withTheme<IUserSignUpInputData>(Theme);

const USER_SIGN_UP_FORM_VALIDATOR = customizeValidator<IUserSignUpInputData>();

const userSignUpFormCustomValidate: CustomValidator<IUserSignUpInputData> = (
  formData: IUserSignUpInputData | undefined,
  errors: FormValidation<IUserSignUpInputData>
): FormValidation<IUserSignUpInputData> => {
  // Skip if no form data or errors
  if (formData === undefined || errors.username === undefined || errors.confirmPassword === undefined) {
    return errors;
  }
  const IS_USERNAME_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.isUsernameAvailable(formData.username);
  if (IS_USERNAME_AVAILABLE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
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
    (data: IChangeEvent<IUserSignUpInputData>): void => {
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
      // Extract user sign up data from input data
      const USER_SIGN_UP_DATA: IUserSignUpData = {
        username: data.formData.username,
        password: data.formData.password
      };
      appLogger.debug(`Encrypting base new user data for new user "${USER_SIGN_UP_DATA.username}".`);
      encrypt(JSON.stringify(USER_SIGN_UP_DATA), appRootContext.rendererProcessAESKey)
        .then(
          (encryptedBaseNewUserData: IEncryptedUserSignUpData): void => {
            appLogger.debug("Done encrypting base new user data.");
            const SIGN_UP_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.signUp(encryptedBaseNewUserData);
            if (SIGN_UP_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
              enqueueSnackbar({ message: "Sign up error.", variant: "error" });
              return;
            }
            if (SIGN_UP_RESPONSE.data) {
              appLogger.info(`Sign up successful for new user "${USER_SIGN_UP_DATA.username}".`);
              if (appRootContext.rendererProcessAESKey === null) {
                appLogger.debug("Null AES encryption key. Cannot encrypt new user sign in credentials. No-op.");
                enqueueSnackbar({ message: "Missing encryption key.", variant: "error" });
                return;
              }
              // Extract sign in data from base new user data
              const NEW_USER_SIGN_IN_DATA: IUserSignInData = {
                username: USER_SIGN_UP_DATA.username,
                password: USER_SIGN_UP_DATA.password
              };
              let encryptedUserSignInData: IEncryptedUserSignInData | null = null;
              appLogger.debug(`Encrypting new user sign in credentials for new user "${NEW_USER_SIGN_IN_DATA.username}".`);
              encrypt(JSON.stringify(NEW_USER_SIGN_IN_DATA), appRootContext.rendererProcessAESKey)
                .then(
                  (encryptedNewUserSignInCredentials: IEncryptedUserSignInData): void => {
                    appLogger.debug("Done encrypting new user sign in credentials.");
                    encryptedUserSignInData = encryptedNewUserSignInCredentials;
                  },
                  (reason: unknown): void => {
                    const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
                    appLogger.error(
                      `Could not encrypt new user sign in credentials for new user "${USER_SIGN_UP_DATA.username}". Reason: ${REASON_MESSAGE}.`
                    );
                    encryptedUserSignInData = null;
                    enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
                  }
                )
                .catch((err: unknown): void => {
                  const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
                  appLogger.error(`Could not encrypt new user sign in credentials for new user "${USER_SIGN_UP_DATA.username}". ${ERROR_MESSAGE}.`);
                  encryptedUserSignInData = null;
                  enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
                })
                .finally((): void => {
                  appLogger.debug("Opening successful user sign up dialog.");
                  let userCount: number | null = null;
                  const GET_USER_COUNT_RESPONSE: IPCAPIResponse<number> = window.userAPI.getUserCount();
                  if (GET_USER_COUNT_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
                    userCount = GET_USER_COUNT_RESPONSE.data;
                  }
                  setSuccessfulUserSignUpDialogProps({
                    open: true,
                    username: USER_SIGN_UP_DATA.username,
                    userCount: userCount,
                    encryptedNewUserSignInCredentials: encryptedUserSignInData
                  });
                  enqueueSnackbar({ message: "Signed up." });
                });
            } else {
              appLogger.info(`Could not signup new user "${USER_SIGN_UP_DATA.username}".`);
              enqueueSnackbar({ message: "Sign up error.", variant: "error" });
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt base new user data for new user "${USER_SIGN_UP_DATA.username}". Reason: ${REASON_MESSAGE}.`);
            enqueueSnackbar({ message: "Account data encryption error.", variant: "error" });
          }
        )
        .catch((err: unknown): void => {
          const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
          appLogger.error(`Could not encrypt base new user data for new user "${USER_SIGN_UP_DATA.username}". ${ERROR_MESSAGE}.`);
          enqueueSnackbar({ message: "Account data encryption error.", variant: "error" });
        });
    },
    [appRootContext.rendererProcessAESKey]
  );

  return (
    <>
      <MUIForm
        schema={USER_SIGN_UP_INPUT_DATA_JSON_SCHEMA as RJSFSchema}
        uiSchema={USER_SIGN_UP_INPUT_DATA_UI_SCHEMA}
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
