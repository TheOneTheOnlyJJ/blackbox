import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { UiSchema } from "@rjsf/utils";
import { INewUserInputData } from "@shared/user/NewUserInputData";

export const NEW_USER_INPUT_DATA_UI_SCHEMA: UiSchema<INewUserInputData> = {
  password: {
    "ui:widget": RJSFPasswordWidget
  },
  confirmPassword: {
    "ui:widget": RJSFPasswordWidget
  }
};
