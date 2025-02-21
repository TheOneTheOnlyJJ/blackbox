import { FC, useCallback, useState } from "react";
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
import { USER_SIGN_IN_INPUT_DATA_UI_SCHEMA } from "@renderer/user/account/uiSchemas/UserSignInInputDataUiSchema";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { IUserSignInInputData, USER_SIGN_IN_INPUT_DATA_JSON_SCHEMA } from "@shared/user/account/input/UserSignInInputData";
import { EncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";

const MUIForm = withTheme<IUserSignInInputData>(Theme);

const USER_SIGN_IN_INPUT_DATA_VALIDATOR = customizeValidator<IUserSignInInputData>();

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

const UserSignInForm: FC = () => {
  const [wasSignInSuccessful, setWasSignInSuccessful] = useState<boolean>(true);
  const handleFormSubmit = useCallback((data: IChangeEvent<IUserSignInInputData>): void => {
    appLogger.info("Submitted user Sign In form.");
    if (data.formData === undefined) {
      appLogger.error("Undefined sign in form data. No-op.");
      enqueueSnackbar({ message: "Missing form data.", variant: "error" });
      return;
    }
    const USERNAME: string = data.formData.username;
    window.IPCTLSAPI.encryptData(JSON.stringify(data.formData), "user sign in credentials")
      .then(
        (encryptedUserSignInData: EncryptedUserSignInData): void => {
          const SIGN_IN_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.signIn(encryptedUserSignInData satisfies EncryptedUserSignInData);
          if (SIGN_IN_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
            if (SIGN_IN_RESPONSE.data) {
              setWasSignInSuccessful(true);
              enqueueSnackbar({ message: "Signed in." });
            } else {
              setWasSignInSuccessful(false);
            }
          } else {
            enqueueSnackbar({ message: "Sign in error.", variant: "error" });
          }
        },
        (reason: unknown): void => {
          const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
          appLogger.error(`Could not encrypt user sign in credentials for user "${USERNAME}". Reason: ${REASON_MESSAGE}.`);
          enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
        }
      )
      .catch((err: unknown): void => {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        appLogger.error(`Could not encrypt user sign in credentials for user "${USERNAME}". Reason: ${ERROR_MESSAGE}.`);
        enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
      });
  }, []);

  return (
    <MUIForm
      schema={USER_SIGN_IN_INPUT_DATA_JSON_SCHEMA as RJSFSchema}
      uiSchema={USER_SIGN_IN_INPUT_DATA_UI_SCHEMA}
      validator={USER_SIGN_IN_INPUT_DATA_VALIDATOR}
      showErrorList={false}
      transformErrors={userSignInFormErrorTransformer}
      onSubmit={handleFormSubmit}
      noHtml5Validate={true}
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
