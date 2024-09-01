import { FC, useCallback, useState } from "react";
import { AppRootContext, useAppRootContext } from "../appRoot/AppRootContext";
import { IBaseNewUserData } from "../../shared/user/IBaseNewUserData";
import { IFormNewUserData, FORM_NEW_USER_DATA_JSON_SCHEMA } from "../../shared/user/IFormNewUserData";
import { Theme } from "@rjsf/mui";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { withTheme, IChangeEvent } from "@rjsf/core";
import { CustomValidator, ErrorTransformer, FormValidation, RJSFSchema, RJSFValidationError, UiSchema } from "@rjsf/utils";
import { appLogger } from "../utils/loggers";
import RJSFPasswordWidget from "./RJSFPasswordWidget";
import { encrypt } from "../utils/encryption/encrypt";
import { IEncryptedBaseNewUserData } from "../../shared/user/encrypted/IEncryptedBaseNewUserData";
import SuccessfulUserRegistrationDialog, { SuccessfulUserSignUpDialogProps } from "./SuccessfulUserSignUpDialog";
import Button from "@mui/material/Button/Button";
import { IUserSignInCredentials } from "../../shared/user/IUserSignInCredentials";
import { IEncryptedUserSignInCredentials } from "../../shared/user/encrypted/IEncryptedUserSignInCredentials";
import { IPCAPIResponse } from "../../shared/IPC/IPCAPIResponse";
import { IPCAPIResponseStatus } from "../../shared/IPC/IPCAPIResponseStatus";

const MUIForm = withTheme<IFormNewUserData>(Theme);

const USER_SIGN_UP_FORM_UI_SCHEMA: UiSchema<IFormNewUserData> = {
  password: {
    "ui:widget": RJSFPasswordWidget
  },
  confirmPassword: {
    "ui:widget": RJSFPasswordWidget
  }
};

const USER_SIGN_UP_FORM_VALIDATOR = customizeValidator<IFormNewUserData>();

const userSignUpFormCustomValidate: CustomValidator<IFormNewUserData> = (
  formData: IFormNewUserData | undefined,
  errors: FormValidation<IFormNewUserData>
): FormValidation<IFormNewUserData> => {
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

const userSignUpFormTransformErrors: ErrorTransformer<IFormNewUserData> = (errors: RJSFValidationError[]): RJSFValidationError[] => {
  return errors.map((error: RJSFValidationError) => {
    // Capitalize first letter
    if (error.message !== undefined) {
      error.message = error.message.charAt(0).toUpperCase() + error.message.slice(1) + ".";
    }
    error.stack = error.stack.charAt(0).toUpperCase() + error.stack.slice(1) + ".";
    return error;
  });
};

const UserSignUpForm: FC = () => {
  const appRootContext: AppRootContext = useAppRootContext();
  const [successfulUserSignUpDialogProps, setSuccessfulUserSignUpDialogProps] = useState<SuccessfulUserSignUpDialogProps>({
    open: false,
    username: "",
    userCount: null,
    encryptedNewUserSignInCredentials: null
  });
  const signUpUser = useCallback(
    (data: IChangeEvent<IFormNewUserData>): void => {
      appLogger.debug("Submitted user sign up form.");
      if (data.formData === undefined) {
        // TODO: RAISE ERROR DIALOG
        appLogger.error("Undefined sign up form data. No-op.");
        return;
      }
      if (appRootContext.rendererProcessAESKey === null) {
        // TODO: RAISE ERROR DIALOG
        appLogger.error("Null AES encryption key. Cannot encrypt base new user data. No-op.");
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
              // TODO: RAISE ERROR DIALOG
              return;
            }
            if (SIGN_UP_RESPONSE.data) {
              appLogger.info(`Sign up successful for new user "${BASE_NEW_USER_DATA.username}".`);
              if (appRootContext.rendererProcessAESKey === null) {
                appLogger.debug("Null AES encryption key. Cannot encrypt new user sign in credentials. No-op.");
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
                    // TODO: RAISE ERROR DIALOG
                    const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
                    appLogger.error(
                      `Could not encrypt new user sign in credentials for new user "${BASE_NEW_USER_DATA.username}". Reason: ${REASON_MESSAGE}.`
                    );
                    encryptedUserSignInCredentials = null;
                  }
                )
                .catch((err: unknown): void => {
                  // TODO: RAISE ERROR DIALOG
                  const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
                  appLogger.error(`Could not encrypt new user sign in credentials for new user "${BASE_NEW_USER_DATA.username}". ${ERROR_MESSAGE}.`);
                  encryptedUserSignInCredentials = null;
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
                });
            } else {
              // TODO: RAISE ERROR SDIALOG
              appLogger.info(`Could not signup new user "${BASE_NEW_USER_DATA.username}".`);
            }
          },
          (reason: unknown): void => {
            // TODO: RAISE ERROR DIALOG
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt base new user data for new user "${BASE_NEW_USER_DATA.username}". Reason: ${REASON_MESSAGE}.`);
          }
        )
        .catch((err: unknown): void => {
          // TODO: RAISE ERROR DIALOG
          const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
          appLogger.error(`Could not encrypt base new user data for new user "${BASE_NEW_USER_DATA.username}". ${ERROR_MESSAGE}.`);
        });
    },
    [appRootContext.rendererProcessAESKey, setSuccessfulUserSignUpDialogProps]
  );

  return (
    <>
      <MUIForm
        schema={FORM_NEW_USER_DATA_JSON_SCHEMA as RJSFSchema}
        uiSchema={USER_SIGN_UP_FORM_UI_SCHEMA}
        validator={USER_SIGN_UP_FORM_VALIDATOR}
        showErrorList={false}
        customValidate={userSignUpFormCustomValidate}
        transformErrors={userSignUpFormTransformErrors}
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
