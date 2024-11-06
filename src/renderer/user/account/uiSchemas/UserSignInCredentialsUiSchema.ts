import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { UiSchema } from "@rjsf/utils";
import { IUserSignInCredentials } from "@shared/user/IUserSignInCredentials";

export const USER_SIGN_IN_CREDENTIALS_UI_SCHEMA: UiSchema<IUserSignInCredentials> = {
  password: {
    "ui:widget": RJSFPasswordWidget
  }
};
