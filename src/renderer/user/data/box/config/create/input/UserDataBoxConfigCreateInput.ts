import RJSFSelectInitialisedOpenUserDataStorageIdWidget from "@renderer/components/RJSFWidgets/RJSFSelectInitialisedOpenUserDataStorageIdWidget";
import { UiSchema } from "@rjsf/utils";
import { USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/box/create/UserDataBoxConfigCreateConstants";
import { JSONSchemaType } from "ajv";

export interface IUserDataBoxConfigCreateInput {
  storageId: string;
  name: string;
  description?: string;
}

export const USER_DATA_BOX_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataBoxConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", ...USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.storageId },
    name: { type: "string", ...USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    description: { type: "string", ...USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.description, nullable: true }
  },
  required: ["name", "storageId"],
  additionalProperties: false
} as const;

export const USER_DATA_BOX_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataBoxConfigCreateInput> = {
  "ui:title": "New box",
  storageId: {
    "ui:title": "Data Storage",
    "ui:widget": RJSFSelectInitialisedOpenUserDataStorageIdWidget,
    "ui:options": {
      showNoSelectionOption: false
    }
  },
  description: {
    "ui:widget": "textarea"
  }
} as const;
