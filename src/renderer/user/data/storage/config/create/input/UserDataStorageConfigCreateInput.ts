import { JSONSchemaType } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA,
  UserDataStorageBackendConfigCreateInput
} from "../../../backend/config/create/input/UserDataStorageBackendConfigCreateInput";
import { UiSchema } from "@rjsf/utils";
import RJSFSelectOpenUserDataStorageVisibilityGroupIdWidget from "@renderer/components/RJSFWidgets/RJSFSelectOpenUserDataStorageVisibilityGroupIdWidget";
import { USER_DATA_STORAGE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/config/create/UserDataStorageConfigCreateConstants";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/constants";

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
  "ui:title": "New data storage configuration",
  description: {
    "ui:widget": "textarea"
  },
  visibilityGroupId: {
    "ui:title": "Visibility Group",
    "ui:description": `Data storage configurations are encrypted with a secret key derived from your account password. If you select a visibility group, your data storage configuration will be encrypted with its key, giving you an additional encryption layer — **losing the password means permanent configuration loss**. You can also choose to leave it unselected (*${PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name}*) for no extra encryption.`,
    "ui:enableMarkdownInDescription": true,
    "ui:widget": RJSFSelectOpenUserDataStorageVisibilityGroupIdWidget,
    "ui:options": {
      showNoSelectionOption: true
    }
  },
  backendConfigCreateInput: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} as const;
