import { FC, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAppRootContext } from "../appRoot/AppRootContext";
import { IBaseNewUserData } from "../../shared/user/IBaseNewUserData";
import { IFormNewUserData, FORM_NEW_USER_DATA_JSON_SCHEMA } from "../../shared/user/IFormNewUserData";
import { Theme } from "@rjsf/mui";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { withTheme, IChangeEvent } from "@rjsf/core";
import { CustomValidator, ErrorTransformer, FormValidation, RJSFSchema, RJSFValidationError, UiSchema } from "@rjsf/utils";
import { appLogger } from "../utils/loggers";
import RJSFPasswordWidget from "../components/RJSFPasswordWidget";
import { encrypt } from "../utils/encryption/encrypt";
import { IEncryptedBaseNewUserData } from "../../shared/user/IEncryptedBaseNewUserData";
import SuccessfulUserRegistrationDialog, { SuccessfulUserRegistrationDialogProps } from "../components/SuccessfulUserRegistrationDialog";
import Box from "@mui/material/Box/Box";
import Paper from "@mui/material/Paper/Paper";
import Typography from "@mui/material/Typography/Typography";
import Button from "@mui/material/Button/Button";
import { IUserLoginCredentials } from "../../shared/user/IUserLoginCredentials";
import { IEncryptedUserLoginCredentials } from "../../shared/user/IEncryptedUserLoginCredentials";

const MUIForm = withTheme<IFormNewUserData>(Theme);

const UI_SCHEMA: UiSchema<IFormNewUserData> = {
  password: {
    "ui:widget": RJSFPasswordWidget
  },
  confirmPassword: {
    "ui:widget": RJSFPasswordWidget
  }
};

const FORM_VALIDATOR = customizeValidator<IFormNewUserData>();

const customValidate: CustomValidator<IFormNewUserData> = (
  formData: IFormNewUserData | undefined,
  errors: FormValidation<IFormNewUserData>
): FormValidation<IFormNewUserData> => {
  // Skip if no form data
  if (formData === undefined || errors.username === undefined || errors.confirmPassword === undefined) {
    return errors;
  }
  if (!window.userAPI.isUsernameAvailable(formData.username)) {
    errors.username.addError("This username is not available.");
  }
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword.addError("Does not match password.");
  }
  return errors;
};

const transformErrors: ErrorTransformer<IFormNewUserData> = (errors: RJSFValidationError[]): RJSFValidationError[] => {
  return errors.map((error: RJSFValidationError) => {
    // Capitalize first letter
    if (error.message !== undefined) {
      error.message = error.message.charAt(0).toUpperCase() + error.message.slice(1) + ".";
    }
    error.stack = error.stack.charAt(0).toUpperCase() + error.stack.slice(1) + ".";
    return error;
  });
};

const RegisterPage: FC = () => {
  const appRootContext = useAppRootContext();
  const [successfulUserRegistrationDialogProps, setSuccessfulUserRegistrationDialogProps] = useState<SuccessfulUserRegistrationDialogProps>({
    open: false,
    username: "",
    userCount: -1,
    encryptedNewUserLoginCredentials: null
  });
  const registerNewUser = useCallback(
    (data: IChangeEvent<IFormNewUserData>): void => {
      appLogger.debug("Submitted user registration form.");
      if (data.formData === undefined) {
        appLogger.debug("Undefined form data. No-op.");
        return;
      }
      if (appRootContext.rendererProcessAESKey === null) {
        appLogger.debug("Null AES encryption key. Cannot encrypt base new user data. No-op.");
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
            if (window.userAPI.register(encryptedBaseNewUserData)) {
              appLogger.info(`Registration successful for new user "${BASE_NEW_USER_DATA.username}".`);
              if (appRootContext.rendererProcessAESKey === null) {
                appLogger.debug("Null AES encryption key. Cannot encrypt new user login credentials. No-op.");
                return;
              }
              // Extract login credentials from base new user data
              const NEW_USER_LOGIN_CREDENTIALS: IUserLoginCredentials = {
                username: BASE_NEW_USER_DATA.username,
                password: BASE_NEW_USER_DATA.password
              };
              let encryptedUserLoginCredentials: IEncryptedUserLoginCredentials | null = null;
              appLogger.debug(`Encrypting new user login credentials for new user "${NEW_USER_LOGIN_CREDENTIALS.username}".`);
              encrypt(JSON.stringify(NEW_USER_LOGIN_CREDENTIALS), appRootContext.rendererProcessAESKey)
                .then(
                  (encryptedNewUserLoginCredentials: IEncryptedUserLoginCredentials): void => {
                    appLogger.debug("Done encrypting new user login credentials.");
                    encryptedUserLoginCredentials = encryptedNewUserLoginCredentials;
                  },
                  (reason: unknown): void => {
                    const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
                    appLogger.error(
                      `Could not encrypt new user login credentials for new user "${BASE_NEW_USER_DATA.username}". Reason: ${REASON_MESSAGE}.`
                    );
                    encryptedUserLoginCredentials = null;
                  }
                )
                .catch((err: unknown): void => {
                  const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
                  appLogger.error(`Could not encrypt new user login credentials for new user "${BASE_NEW_USER_DATA.username}". ${ERROR_MESSAGE}.`);
                  encryptedUserLoginCredentials = null;
                })
                .finally((): void => {
                  appLogger.debug("Opening successful user registration dialog.");
                  setSuccessfulUserRegistrationDialogProps({
                    open: true,
                    username: BASE_NEW_USER_DATA.username,
                    userCount: window.userAPI.getUserCount(),
                    encryptedNewUserLoginCredentials: encryptedUserLoginCredentials
                  });
                });
            } else {
              appLogger.info(`Could not register new user "${BASE_NEW_USER_DATA.username}".`);
            }
          },
          (reason: unknown): void => {
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt base new user data for new user "${BASE_NEW_USER_DATA.username}". Reason: ${REASON_MESSAGE}.`);
          }
        )
        .catch((err: unknown): void => {
          const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
          appLogger.error(`Could not encrypt base new user data for new user "${BASE_NEW_USER_DATA.username}". ${ERROR_MESSAGE}.`);
        });
    },
    [appRootContext.rendererProcessAESKey, setSuccessfulUserRegistrationDialogProps]
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundImage: "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);"
      }}
    >
      <Paper
        elevation={24}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          flexDirection: "column",
          width: "80%",
          maxHeight: "80%",
          padding: "2%",
          overflow: "auto"
        }}
      >
        <Typography variant="h4">Register</Typography>
        {
          // TODO: Password fields should turn red on validation errors. Check that
        }
        <MUIForm
          schema={FORM_NEW_USER_DATA_JSON_SCHEMA as RJSFSchema}
          uiSchema={UI_SCHEMA}
          validator={FORM_VALIDATOR}
          showErrorList={false}
          customValidate={customValidate}
          transformErrors={transformErrors}
          onSubmit={registerNewUser}
        >
          <Button type="submit" variant="contained" disabled={!appRootContext.isUserStorageAvailable} sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
            Register
          </Button>
        </MUIForm>
        <Link style={{ paddingBottom: "1vw" }} to="/">
          Back to Login
        </Link>
      </Paper>
      <SuccessfulUserRegistrationDialog {...successfulUserRegistrationDialogProps} />
    </Box>
  );
};

export default RegisterPage;
