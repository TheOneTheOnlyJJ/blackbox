import { JSONSchemaType } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA,
  UserDataStorageBackendConfigCreateInput
} from "../../../backend/config/create/input/UserDataStorageBackendConfigCreateInput";
import { UiSchema } from "@rjsf/utils";
import RJSFSelectOpenUserDataStorageVisibilityGroupWidget from "@renderer/components/RJSFWidgets/RJSFSelectOpenUserDataStorageVisibilityGroupWidget";
import { USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/config/create/UserDataStorageConfigCreateConstants";

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
    name: { type: "string", ...USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    description: { type: "string", ...USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.description, nullable: true },
    visibilityGroupId: { type: "string", ...USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.visibilityGroupId, nullable: true },
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
    "ui:description":
      "If you select a Visibility Group, your Data Storage Configuration will be encrypted with its key — **losing the password means permanent data loss**. You can also choose to leave it unselected for no extra encryption.",
    "ui:enableMarkdownInDescription": true,
    "ui:widget": RJSFSelectOpenUserDataStorageVisibilityGroupWidget
  },
  backendConfigCreateInput: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} as const;
