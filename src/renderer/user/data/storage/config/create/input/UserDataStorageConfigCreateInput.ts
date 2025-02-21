import { JSONSchemaType } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA,
  UserDataStorageBackendConfigCreateInput
} from "../../../backend/config/create/input/UserDataStorageBackendConfigCreateInput";
import { UiSchema } from "@rjsf/utils";

export interface IUserDataStorageConfigCreateInput {
  name: string;
  visibilityPassword?: string;
  // TODO: Add description & icon/image & confirm visibility password, implies new transformation in renderer
  backendConfigCreateInput: UserDataStorageBackendConfigCreateInput;
}

export const USER_DATA_STORAGE_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
    visibilityPassword: { type: "string", title: "Visibility Password", nullable: true },
    backendConfigCreateInput: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA
  },
  required: ["name", "backendConfigCreateInput"],
  additionalProperties: false
} as const;

export const USER_DATA_STORAGE_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataStorageConfigCreateInput> = {
  "ui:title": "New Data Storage",
  visibilityPassword: {
    "ui:description":
      "**Important:** The visibility password **does not encrypt the data**; it only restricts visibility. \
      Leaving this field empty will create a **visible Data Storage** by default. \
      If you set a visibility password, **do not forget it**, as you will need it to access the Data Storage.",
    "ui:enableMarkdownInDescription": true
  },
  backendConfigCreateInput: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} as const;
