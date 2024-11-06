import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { UiSchema } from "@rjsf/utils";
import { IUserSignInInputData } from "@renderer/user/account/inputData/UserSignInInputData";

export const USER_SIGN_IN_INPUT_DATA_UI_SCHEMA: UiSchema<IUserSignInInputData> = {
  username: {
    "ui:title": "Username"
  },
  password: {
    "ui:widget": RJSFPasswordWidget,
    "ui:title": "Password"
  }
} as const;
