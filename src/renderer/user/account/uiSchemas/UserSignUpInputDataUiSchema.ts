import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { UiSchema } from "@rjsf/utils";
import { USER_SIGN_UP_DATA_CONSTANTS } from "@shared/user/account/UserSignUpDataConstants";
import { IUserSignUpInputData } from "@shared/user/account/input/UserSignUpInputData";

export const USER_SIGN_UP_INPUT_DATA_UI_SCHEMA: UiSchema<IUserSignUpInputData> = {
  username: {
    "ui:title": "Username",
    "ui:description": `Unique to every user. Maximum ${USER_SIGN_UP_DATA_CONSTANTS.username.maxLength.toString()} characters`
  },
  password: {
    "ui:widget": RJSFPasswordWidget,
    "ui:title": "Password",
    "ui:description": `Must have at least ${USER_SIGN_UP_DATA_CONSTANTS.password.minLength.toString()} characters`
  },
  confirmPassword: {
    "ui:widget": RJSFPasswordWidget,
    "ui:title": "Confirm Password",
    "ui:description": "Must match password"
  }
} as const;
