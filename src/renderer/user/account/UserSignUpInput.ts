import { JSONSchemaType } from "ajv";
import { USER_SIGN_UP_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/UserSignUpConstants";
import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { UiSchema } from "@rjsf/utils";

export interface IUserSignUpInput {
  username: string;
  password: string;
  confirmPassword: string;
}

export const USER_SIGN_UP_INPUT_JSON_SCHEMA: JSONSchemaType<IUserSignUpInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: { type: "string", ...USER_SIGN_UP_JSON_SCHEMA_CONSTANTS.username },
    password: { type: "string", ...USER_SIGN_UP_JSON_SCHEMA_CONSTANTS.password },
    confirmPassword: { type: "string", ...USER_SIGN_UP_JSON_SCHEMA_CONSTANTS.password }
  },
  required: ["username", "password", "confirmPassword"],
  additionalProperties: false
} as const;

export const USER_SIGN_UP_INPUT_UI_SCHEMA: UiSchema<IUserSignUpInput> = {
  username: {
    "ui:description": `Unique to every user. Maximum ${USER_SIGN_UP_JSON_SCHEMA_CONSTANTS.username.maxLength.toString()} characters`
  },
  password: {
    "ui:widget": RJSFPasswordWidget,
    "ui:title": "Password",
    "ui:description": `Must have at least ${USER_SIGN_UP_JSON_SCHEMA_CONSTANTS.password.minLength.toString()} characters`
  },
  confirmPassword: {
    "ui:widget": RJSFPasswordWidget,
    "ui:title": "Confirm Password",
    "ui:description": "Must match password"
  }
} as const;
