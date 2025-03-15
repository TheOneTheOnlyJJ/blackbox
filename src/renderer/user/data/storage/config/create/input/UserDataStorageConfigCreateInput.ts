import { JSONSchemaType } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA,
  UserDataStorageBackendConfigCreateInput
} from "../../../backend/config/create/input/UserDataStorageBackendConfigCreateInput";
import { UiSchema } from "@rjsf/utils";
import RJSFSelectOpenUserDataStorageVisibilityGroupWidget from "@renderer/components/RJSFWidgets/RJSFSelectOpenUserDataStorageVisibilityGroupWidget";

export interface IUserDataStorageConfigCreateInput {
  name: string;
  description?: string;
  visibilityGroupId?: string;
  // TODO: Add icon/image
  backendConfigCreateInput: UserDataStorageBackendConfigCreateInput;
}

export const USER_DATA_STORAGE_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
    description: { type: "string", title: "Description", nullable: true },
    visibilityGroupId: { type: "string", format: "uuid", nullable: true },
    backendConfigCreateInput: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA
  },
  required: ["name", "backendConfigCreateInput"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGE_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataStorageConfigCreateInput> = {
  "ui:title": "New Data Storage",
  description: {
    "ui:widget": "textarea"
  },
  visibilityGroupId: {
    "ui:title": "Visibility Group",
    "ui:description": "DESCRIPTIOPN", // TODO: Add this, with markdown
    "ui:widget": RJSFSelectOpenUserDataStorageVisibilityGroupWidget
  },
  backendConfigCreateInput: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} as const;
