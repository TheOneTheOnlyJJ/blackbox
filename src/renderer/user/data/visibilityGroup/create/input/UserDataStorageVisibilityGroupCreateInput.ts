import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { UiSchema } from "@rjsf/utils";
import { JSONSchemaType } from "ajv";

export interface IUserDataStorageVisibilityGroupCreateInput {
  name: string;
  password: string;
  confirmPassword: string;
  description?: string;
  openAfterCreating: boolean;
}

export const USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataStorageVisibilityGroupCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
    password: { type: "string", title: "Password" },
    confirmPassword: { type: "string", title: "Confirm Password" },
    description: { type: "string", title: "Description", nullable: true },
    openAfterCreating: { type: "boolean", title: "Open After Creating" }
  },
  required: ["name", "password", "confirmPassword", "openAfterCreating"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataStorageVisibilityGroupCreateInput> = {
  "ui:title": "New Data Storage Visibility Group",
  name: {
    "ui:description": "This is required only to differenciate different visibility groups from one another."
  },
  description: {
    "ui:widget": "textarea"
  },
  password: {
    "ui:title": "Password",
    "ui:widget": RJSFPasswordWidget
  },
  confirmPassword: {
    "ui:title": "Confirm Password",
    "ui:widget": RJSFPasswordWidget
  },
  openAfterCreating: {
    "ui:description": "Will open all visibility groups with the same password."
  }
} as const;
