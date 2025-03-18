import RJSFPasswordWidget from "@renderer/components/RJSFWidgets/RJSFPasswordWidget";
import { UiSchema } from "@rjsf/utils";
import { USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/config/create/UserDataStorageVisibilityGroupConfigCreateConstants";
import { JSONSchemaType } from "ajv";

export interface IUserDataStorageVisibilityGroupConfigCreateInput {
  name: string;
  password: string;
  confirmPassword: string;
  description?: string;
  openAfterCreating?: boolean;
}

export const USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataStorageVisibilityGroupConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string", ...USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    password: { type: "string", ...USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.password },
    confirmPassword: { type: "string", ...USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.password },
    description: { type: "string", ...USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.description, nullable: true },
    openAfterCreating: { type: "boolean", title: "Open After Creating", nullable: true }
  },
  required: ["name", "password", "confirmPassword"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataStorageVisibilityGroupConfigCreateInput> = {
  "ui:title": "New Data Storage Visibility Group",
  description: {
    "ui:widget": "textarea"
  },
  password: {
    "ui:title": "Password",
    "ui:description": "When opening Visibility Groups, **only the password is required**.",
    "ui:enableMarkdownInDescription": true,
    "ui:widget": RJSFPasswordWidget
  },
  confirmPassword: {
    "ui:title": "Confirm Password",
    "ui:widget": RJSFPasswordWidget
  },
  openAfterCreating: {
    "ui:help": "Will open the new Visibility Group **and all other visibility groups with the same password**, if any.",
    "ui:enableMarkdownInDescription": true // TODO: Open issue as this does not work. Done: https://github.com/rjsf-team/react-jsonschema-form/issues/4527 Now wait for fix
  }
} as const;
