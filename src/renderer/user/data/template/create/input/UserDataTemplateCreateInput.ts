import RJSFSelectAvailableUserDataBoxIdWidget from "@renderer/components/RJSFWidgets/RJSFSelectAvailableUserDataBoxIdWidget";
import RJSFSelectInitialisedOpenUserDataStorageIdWidget from "@renderer/components/RJSFWidgets/RJSFSelectInitialisedOpenUserDataStorageIdWidget";
import { UiSchema } from "@rjsf/utils";
import { USER_DATA_TEMPLATE_CREATE_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/template/create/UserDataTemplateCreateConstants";
import { JSONSchemaType } from "ajv";

export interface IUserDataTemplateCreateInput {
  boxId: string;
  storageId: string;
  name: string;
  description?: string;
}

export const USER_DATA_TEMPLATE_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    boxId: { type: "string", ...USER_DATA_TEMPLATE_CREATE_JSON_SCHEMA_CONSTANTS.boxId },
    storageId: { type: "string", ...USER_DATA_TEMPLATE_CREATE_JSON_SCHEMA_CONSTANTS.storageId },
    name: { type: "string", ...USER_DATA_TEMPLATE_CREATE_JSON_SCHEMA_CONSTANTS.name },
    description: { type: "string", ...USER_DATA_TEMPLATE_CREATE_JSON_SCHEMA_CONSTANTS.description, nullable: true }
  },
  required: ["boxId", "storageId", "name"],
  additionalProperties: false
} as const;

export const USER_DATA_TEMPLATE_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataTemplateCreateInput> = {
  "ui:title": "New template",
  storageId: {
    "ui:title": "Data Storage",
    "ui:widget": RJSFSelectInitialisedOpenUserDataStorageIdWidget,
    "ui:options": {
      showNoSelectionOption: false
    }
  },
  // TODO: FInd a way to make the boxes select options limited to the currently selected storage id
  boxId: {
    "ui:title": "Box",
    "ui:widget": RJSFSelectAvailableUserDataBoxIdWidget,
    "ui:options": {
      showNoSelectionOption: false
    }
  },
  description: {
    "ui:widget": "textarea"
  }
} as const;
