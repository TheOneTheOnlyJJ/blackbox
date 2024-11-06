import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { UiSchema } from "@rjsf/utils";
import { USER_SIGN_UP_DATA_CONSTRAINTS } from "@shared/user/account/UserSignUpDataConstraints";
import { IUserSignUpInputData } from "@renderer/user/account/inputData/UserSignUpInputData";

export const USER_SIGN_UP_INPUT_DATA_UI_SCHEMA: UiSchema<IUserSignUpInputData> = {
  username: {
    "ui:title": "Username",
    "ui:description": `Unique to every user. Maximum ${USER_SIGN_UP_DATA_CONSTRAINTS.username.maxLength.toString()} characters`
  },
  password: {
    "ui:widget": RJSFPasswordWidget,
    "ui:title": "Password",
    "ui:description": `Minimum ${USER_SIGN_UP_DATA_CONSTRAINTS.password.minLength.toString()} characters`
  },
  confirmPassword: {
    "ui:widget": RJSFPasswordWidget,
    "ui:title": "Confirm Password",
    "ui:description": "Must match password"
  }
} as const;
