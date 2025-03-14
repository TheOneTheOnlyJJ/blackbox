import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { UiSchema } from "@rjsf/utils";
import { JSONSchemaType } from "ajv";

export interface IUserDataStorageVisibilityGroupOpenRequestInput {
  password: string;
  confirmPassword: string;
}

export const USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataStorageVisibilityGroupOpenRequestInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    password: { type: "string", title: "Password" },
    confirmPassword: { type: "string", title: "Confirm Password" }
  },
  required: ["password", "confirmPassword"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGE_VISIBILITY_GROUP_OPEN_REQUEST_INPUT_UI_SCHEMA: UiSchema<IUserDataStorageVisibilityGroupOpenRequestInput> = {
  "ui:title": "Open Data Storage Visibility Group",
  password: {
    "ui:title": "Password",
    "ui:widget": RJSFPasswordWidget
  },
  confirmPassword: {
    "ui:title": "Confirm Password",
    "ui:widget": RJSFPasswordWidget
  }
} as const;
