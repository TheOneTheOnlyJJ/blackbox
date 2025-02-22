import { JSONSchemaType } from "ajv/dist/types/json-schema";
import { UiSchema } from "@rjsf/utils";
import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { USER_SIGN_IN_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/UserSignInConstants";

export interface IUserSignInInput {
  username: string;
  password: string;
}

export const USER_SIGN_IN_INPUT_JSON_SCHEMA: JSONSchemaType<IUserSignInInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    username: { type: "string", ...USER_SIGN_IN_JSON_SCHEMA_CONSTANTS.username },
    password: { type: "string", ...USER_SIGN_IN_JSON_SCHEMA_CONSTANTS.password }
  },
  required: ["username", "password"],
  additionalProperties: false
} as const;

export const USER_SIGN_IN_INPUT_UI_SCHEMA: UiSchema<IUserSignInInput> = {
  password: {
    "ui:widget": RJSFPasswordWidget,
    "ui:title": "Password"
  }
} as const;
