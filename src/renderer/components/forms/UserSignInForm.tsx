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
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { IUserSignInInput, USER_SIGN_IN_INPUT_JSON_SCHEMA, USER_SIGN_IN_INPUT_UI_SCHEMA } from "@renderer/user/account/UserSignInInput";
import { userSignInInputToUserSignInDTO } from "@renderer/user/account/utils/userSignInInputToUserSignInDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";

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

const UserSignInForm: FC = () => {
  const [wasSignInSuccessful, setWasSignInSuccessful] = useState<boolean>(true);
  const handleFormSubmit = useCallback((data: IChangeEvent<IUserSignInInput>): void => {
    appLogger.info("Submitted user Sign In form.");
    if (data.formData === undefined) {
      appLogger.error("Undefined sign in form data. No-op.");
      enqueueSnackbar({ message: "Missing form data.", variant: "error" });
      return;
    }
    const USERNAME: string = data.formData.username;
    window.IPCTLSAPI.encrypt<IUserSignInDTO>(userSignInInputToUserSignInDTO(data.formData, appLogger), "user sign in DTO")
      .then(
        (encryptedUserSignInDTO: IEncryptedData<IUserSignInDTO>): void => {
          const SIGN_IN_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.signIn(encryptedUserSignInDTO);
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
      .catch((err: unknown): void => {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        appLogger.error(`Could not encrypt user sign in DTO for user "${USERNAME}". Reason: ${ERROR_MESSAGE}.`);
        enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
      });
  }, []);

  return (
    <MUIForm
      schema={USER_SIGN_IN_INPUT_JSON_SCHEMA as RJSFSchema}
      uiSchema={USER_SIGN_IN_INPUT_UI_SCHEMA}
      validator={USER_SIGN_IN_INPUT_VALIDATOR}
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
