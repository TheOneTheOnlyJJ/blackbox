/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Button, Paper, Typography } from "@mui/material";
import { FC, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useRootContext } from "../root/RootContext";
import { IBaseNewUserData } from "../../shared/user/IBaseNewUserData";
import { IFormNewUserData, FORM_NEW_USER_DATA_JSON_SCHEMA } from "../../shared/user/IFormNewUserData";
import { Theme } from "@rjsf/mui";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { withTheme, IChangeEvent } from "@rjsf/core";
import { CustomValidator, ErrorTransformer, FormValidation, RJSFSchema, RJSFValidationError, UiSchema } from "@rjsf/utils";
import { appLogger } from "../utils/loggers";
import RJSFPasswordWidget from "../components/RJSFPasswordWidget";

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
  errors: FormValidation<IFormNewUserData>,
  _: UiSchema<IFormNewUserData> | undefined
) => {
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

const transformErrors: ErrorTransformer<IFormNewUserData> = (errors: RJSFValidationError[], _: UiSchema<IFormNewUserData> | undefined) => {
  return errors.map((error: RJSFValidationError) => {
    // Capitalize first letter
    if (error.message !== undefined) {
      error.message = error.message.charAt(0).toUpperCase() + error.message.slice(1) + ".";
    }
    error.stack = error.stack.charAt(0).toUpperCase() + error.stack.slice(1) + ".";
    return error;
  });
};

const onSubmit: (data: IChangeEvent<IFormNewUserData>, event: FormEvent) => void = (data: IChangeEvent<IFormNewUserData>, _: FormEvent) => {
  appLogger.debug("Submitted user registration form.");
  if (data.formData === undefined) {
    appLogger.debug("Undefined form data. No-op.");
    return;
  }
  // Delete this
  appLogger.silly(`Data submitted: ${JSON.stringify(data.formData, null, 2)}.`);
  // TODO: Encrypt with IPC encryption key
  const RAW_DATA: IBaseNewUserData = {
    username: data.formData.username,
    password: data.formData.password
  };
  if (window.userAPI.register(RAW_DATA)) {
    appLogger.info(`Registered new user ${RAW_DATA.username}!`);
  } else {
    appLogger.info(`Could not register new user ${RAW_DATA.username}!`);
  }
  // TODO: Add confirmation screen
};

const RegisterPage: FC = () => {
  const appContext = useRootContext();
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
          onSubmit={onSubmit}
        >
          <Button type="submit" variant="contained" disabled={!appContext.isUserStorageAvailable} sx={{ marginTop: "1vw", marginBottom: "1vw" }}>
            Register
          </Button>
        </MUIForm>
        <Link style={{ paddingBottom: "1vw" }} to="/">
          Back to Login
        </Link>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
