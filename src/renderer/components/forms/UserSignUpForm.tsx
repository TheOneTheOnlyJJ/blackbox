import { FC, useCallback, useState } from "react";
import { IUserSignUpInput, USER_SIGN_UP_INPUT_JSON_SCHEMA, USER_SIGN_UP_INPUT_UI_SCHEMA } from "@renderer/user/account/UserSignUpInput";
import { Theme } from "@rjsf/mui";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { withTheme, IChangeEvent } from "@rjsf/core";
import { CustomValidator, ErrorTransformer, FormValidation, RJSFSchema, RJSFValidationError } from "@rjsf/utils";
import { appLogger } from "@renderer/utils/loggers";
import { EncryptedUserSignUpDTO } from "@shared/user/account/encrypted/EncryptedUserSignUpDTO";
import SuccessfulUserSignUpDialog, { ISuccessfulUserSignUpDialogProps } from "@renderer/components/dialogs/SuccessfulUserSignUpDialog";
import Button from "@mui/material/Button/Button";
import { EncryptedUserSignInDTO } from "@shared/user/account/encrypted/EncryptedUserSignInDTO";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import { errorCapitalizerErrorTransformer } from "@renderer/utils/RJSF/errorTransformers/errorCapitalizerErrorTransformer";
import { userSignUpInputToUserSignUpDTO } from "@renderer/user/account/utils/userSignUpInputToUserSignUpDTO";
import { userSignUpInputToUserSignInDTO } from "@renderer/user/account/utils/userSignUpInputToUserSignInDTO";

const MUIForm = withTheme<IUserSignUpInput>(Theme);

const USER_SIGN_UP_INPUT_VALIDATOR = customizeValidator<IUserSignUpInput>();

const userSignUpFormErrorTransformer: ErrorTransformer = (errors: RJSFValidationError[]): RJSFValidationError[] => {
  return errorCapitalizerErrorTransformer(
    errors.map((error: RJSFValidationError) => {
      if (error.name === "required" && error.property !== undefined) {
        if (error.property === "confirmPassword") {
          error.message = "Must confirm Password";
        } else {
          // TODO: Extract title from error: https://github.com/rjsf-team/react-jsonschema-form/issues/4504
          error.message = `Must provide ${error.property.charAt(0).toUpperCase()}${error.property.slice(1)}`;
        }
      }
      if (error.name === "pattern" && error.property === ".username") {
        error.message = "Username must only use letters, digits and underlines";
      }
      return error;
    })
  );
};

const userSignUpFormValidator: CustomValidator<IUserSignUpInput> = (
  formData: IUserSignUpInput | undefined,
  errors: FormValidation<IUserSignUpInput>
): FormValidation<IUserSignUpInput> => {
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
  const [successfulUserSignUpDialogProps, setSuccessfulUserSignUpDialogProps] = useState<ISuccessfulUserSignUpDialogProps>({
    open: false,
    username: "",
    userCount: null,
    encryptedNewUserSignInDTO: null
  });
  const signUpUser = useCallback((data: IChangeEvent<IUserSignUpInput>): void => {
    appLogger.debug("Submitted user Sign Up form.");
    if (data.formData === undefined) {
      appLogger.error("Undefined sign up form data. No-op.");
      enqueueSnackbar({ message: "Missing form data.", variant: "error" });
      return;
    }
    const USERNAME: string = data.formData.username;
    const FORM_DATA: IUserSignUpInput = data.formData;
    window.IPCTLSAPI.encryptData(JSON.stringify(userSignUpInputToUserSignUpDTO(FORM_DATA, appLogger)), "user sign up DTO")
      .then(
        (encryptedUserSignUpDTO: EncryptedUserSignUpDTO): void => {
          const SIGN_UP_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.signUp(encryptedUserSignUpDTO satisfies EncryptedUserSignUpDTO);
          if (SIGN_UP_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
            if (SIGN_UP_RESPONSE.data) {
              appLogger.info(`Signed up new user "${USERNAME}".`);
              enqueueSnackbar({ message: `${USERNAME} signed up.`, variant: "info" });
              // Extract sign in data from sign up user data
              let encryptedNewUserSignInDTO: EncryptedUserSignInDTO | null = null;
              window.IPCTLSAPI.encryptData(JSON.stringify(userSignUpInputToUserSignInDTO(FORM_DATA, appLogger)), "new user sign in DTO")
                .then(
                  (encryptedUserSignInDTO: EncryptedUserSignInDTO): void => {
                    encryptedNewUserSignInDTO = encryptedUserSignInDTO satisfies EncryptedUserSignInDTO;
                  },
                  (reason: unknown): void => {
                    const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
                    appLogger.error(`Could not encrypt user sign in DTO for new user "${USERNAME}": ${REASON_MESSAGE}.`);
                    enqueueSnackbar({ message: "Credentials encryption error.", variant: "error" });
                  }
                )
                .catch((err: unknown): void => {
                  const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
                  appLogger.error(`Could not encrypt user sign in DTO for new user "${USERNAME}": ${ERROR_MESSAGE}.`);
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
                    username: USERNAME,
                    userCount: userCount,
                    encryptedNewUserSignInDTO: encryptedNewUserSignInDTO
                  });
                });
            } else {
              appLogger.info(`Could not sign up new user "${USERNAME}".`);
              enqueueSnackbar({ message: "Sign up error.", variant: "error" });
            }
          } else {
            appLogger.error(`Sign up error: ${SIGN_UP_RESPONSE.error}!`);
            enqueueSnackbar({ message: "Sign up error.", variant: "error" });
          }
        },
        (reason: unknown): void => {
          const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
          appLogger.error(`Could not encrypt sign up DTO for new user "${USERNAME}": ${REASON_MESSAGE}.`);
          enqueueSnackbar({ message: "Account data encryption error.", variant: "error" });
        }
      )
      .catch((err: unknown): void => {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        appLogger.error(`Could not encrypt sign up DTO for new user "${USERNAME}": ${ERROR_MESSAGE}.`);
        enqueueSnackbar({ message: "Account data encryption error.", variant: "error" });
      });
  }, []);

  return (
    <>
      <MUIForm
        schema={USER_SIGN_UP_INPUT_JSON_SCHEMA as RJSFSchema}
        uiSchema={USER_SIGN_UP_INPUT_UI_SCHEMA}
        validator={USER_SIGN_UP_INPUT_VALIDATOR}
        showErrorList={false}
        customValidate={userSignUpFormValidator}
        transformErrors={userSignUpFormErrorTransformer}
        onSubmit={signUpUser}
        noHtml5Validate={true}
      >
        <Button type="submit" variant="contained" size="large" sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
          Sign Up
        </Button>
      </MUIForm>
      <SuccessfulUserSignUpDialog {...successfulUserSignUpDialogProps} />
    </>
  );
};

export default UserSignUpForm;
