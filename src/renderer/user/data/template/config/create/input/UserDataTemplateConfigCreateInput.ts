import RJSFSelectAvailableUserDataBoxIdWidget, {
  IRJSFSelectAvailableUserDataBoxIdWidgetOptions
} from "@renderer/components/RJSFWidgets/RJSFSelectAvailableUserDataBoxIdWidget";
import RJSFSelectInitialisedUserDataStorageIdWidget, {
  IRJSFSelectInitialisedUserDataStorageIdWidgetOptions
} from "@renderer/components/RJSFWidgets/RJSFSelectInitialisedUserDataStorageIdWidget";
import { UiSchema } from "@rjsf/utils";
import { USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/template/config/create/UserDataTemplateConfigCreateConstants";
import { JSONSchemaType } from "ajv";
import {
  USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  UserDataTemplateFieldConfigCreateInput
} from "../../../field/config/create/input/UserDataTemplateFieldConfigCreateInput";

export interface IUserDataTemplateConfigCreateInput {
  storageId: string;
  boxId: string;
  name: string;
  description?: string;
  fields: UserDataTemplateFieldConfigCreateInput[];
}

export const USER_DATA_TEMPLATE_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.storageId },
    boxId: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.boxId },
    name: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    description: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.description, nullable: true },
    // TODO: Investigate uniqueItems? At least template names should be unique
    fields: { type: "array", items: USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA, minItems: 1 }
  },
  required: ["boxId", "storageId", "name", "fields"],
  additionalProperties: false
} as const;

export const USER_DATA_TEMPLATE_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataTemplateConfigCreateInput> = {
  "ui:title": "New template",
  storageId: {
    "ui:title": "Data Storage",
    "ui:widget": RJSFSelectInitialisedUserDataStorageIdWidget,
    "ui:options": {
      showNoSelectionOption: false,
      onlyAllowOpenSelection: true
    } satisfies IRJSFSelectInitialisedUserDataStorageIdWidgetOptions
  },
  boxId: {
    "ui:title": "Box",
    "ui:widget": RJSFSelectAvailableUserDataBoxIdWidget,
    "ui:options": {
      showNoSelectionOption: false,
      formContextOptions: {
        selectedUserDataStorageIdFormContext: { use: true, disableWhenNoSelection: true }
      }
    } satisfies IRJSFSelectAvailableUserDataBoxIdWidgetOptions
  },
  description: {
    "ui:widget": "textarea"
  },
  fields: {
    "ui:title": "Fields",
    items: USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA
  }
} as const;
