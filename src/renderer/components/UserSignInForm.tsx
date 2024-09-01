import { FC, useCallback, useState } from "react";
import { IUserSignInCredentials, USER_SIGN_IN_CREDENTIALS_JSON_SCHEMA } from "../../shared/user/IUserSignInCredentials";
import { encrypt } from "../utils/encryption/encrypt";
import { IPCAPIResponse } from "../../shared/IPC/IPCAPIResponse";
import { IChangeEvent, withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/mui";
import { ErrorTransformer, RJSFSchema, RJSFValidationError, UiSchema } from "@rjsf/utils";
import RJSFPasswordWidget from "./RJSFPasswordWidget";
import { customizeValidator } from "@rjsf/validator-ajv8";
import Button from "@mui/material/Button/Button";
import { AppRootContext, useAppRootContext } from "../appRoot/AppRootContext";
import { IEncryptedUserSignInCredentials } from "../../shared/user/encrypted/IEncryptedUserSignInCredentials";
import { appLogger } from "../utils/loggers";
import { IPCAPIResponseStatus } from "../../shared/IPC/IPCAPIResponseStatus";
import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";

const MUIForm = withTheme<IUserSignInCredentials>(Theme);

const USER_SIGN_IN_FORM_UI_SCHEMA: UiSchema<IUserSignInCredentials> = {
  password: {
    "ui:widget": RJSFPasswordWidget
  }
};

const USER_SIGN_IN_FORM_VALIDATOR = customizeValidator<IUserSignInCredentials>();

const userSignInFormTransformErrors: ErrorTransformer<IUserSignInCredentials> = (errors: RJSFValidationError[]): RJSFValidationError[] => {
  return errors.map((error: RJSFValidationError) => {
    // Capitalize first letter
    if (error.message !== undefined) {
      error.message = error.message.charAt(0).toUpperCase() + error.message.slice(1) + ".";
    }
    error.stack = error.stack.charAt(0).toUpperCase() + error.stack.slice(1) + ".";
    return error;
  });
};

const UserSignInForm: FC = () => {
  const appRootContext: AppRootContext = useAppRootContext();
  const [wasSignInSuccessful, setWasSignInSuccessful] = useState<boolean>(true);
  const handleSubmit = useCallback(
    (data: IChangeEvent<IUserSignInCredentials>): void => {
      if (data.formData === undefined) {
        // TODO: RAISE ERROR DIALOG
        appLogger.error("Undefined sign in form data. No-op.");
        return;
      }
      if (appRootContext.rendererProcessAESKey === null) {
        // TODO: RAISE ERROR DIALOG
        appLogger.error("Null AES encryption key. Cannot encrypt sign in user credentials. No-op.");
        return;
      }
      const USERNAME: string = data.formData.username;
      encrypt(JSON.stringify(data.formData), appRootContext.rendererProcessAESKey)
        .then(
          (encryptedUserSignInCredentials: IEncryptedUserSignInCredentials): void => {
            appLogger.debug("Done encrypting user sign in credentials.");
            const SIGN_IN_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.signIn(encryptedUserSignInCredentials);
            if (SIGN_IN_RESPONSE.status === IPCAPIResponseStatus.SUCCESS) {
              setWasSignInSuccessful(SIGN_IN_RESPONSE.data);
            }
            // TODO: RAISE ERROR DIALOG
          },
          (reason: unknown): void => {
            // TODO: RAISE ERROR DIALOG
            const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
            appLogger.error(`Could not encrypt user sign in credentials for user "${USERNAME}". Reason: ${REASON_MESSAGE}.`);
          }
        )
        .catch((err: unknown): void => {
          // TODO: RAISE ERROR DIALOG
          const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
          appLogger.error(`Could not encrypt user sign in credentials for user "${USERNAME}". ${ERROR_MESSAGE}.`);
        });
    },
    [appRootContext.rendererProcessAESKey, setWasSignInSuccessful]
  );

  return (
    <MUIForm
      schema={USER_SIGN_IN_CREDENTIALS_JSON_SCHEMA as RJSFSchema}
      uiSchema={USER_SIGN_IN_FORM_UI_SCHEMA}
      validator={USER_SIGN_IN_FORM_VALIDATOR}
      showErrorList={false}
      transformErrors={userSignInFormTransformErrors}
      onSubmit={handleSubmit}
    >
      {!wasSignInSuccessful && (
        <Alert severity="error" sx={{ marginTop: "1vw" }}>
          <AlertTitle>Invalid credentials!</AlertTitle>
          The username or password you entered are incorrect!
        </Alert>
      )}
      <Button type="submit" variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
        Sign In
      </Button>
    </MUIForm>
  );
};

export default UserSignInForm;
