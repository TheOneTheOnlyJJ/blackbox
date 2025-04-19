import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType } from "ajv";

export interface ISelectedUserDataStorageIdFormContext {
  selectedUserDataStorageId?: string;
}

export interface ISelectedUserDataStorageIdFormContextWidgetOptions {
  useSelectedUserDataStorageIdFormContext: boolean;
  disableWhenNoSelectedUserDataStorageIdFormContext: boolean;
}

export const SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_JSON_SCHEMA: JSONSchemaType<ISelectedUserDataStorageIdFormContext> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    selectedUserDataStorageId: { type: "string", format: "uuid", title: "Selected User Data Storage ID", nullable: true }
  },
  additionalProperties: true
} as const;

export const SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA: JSONSchemaType<ISelectedUserDataStorageIdFormContextWidgetOptions> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      useSelectedUserDataStorageIdFormContext: { type: "boolean", title: "Show no selection option" },
      disableWhenNoSelectedUserDataStorageIdFormContext: { type: "boolean", title: "Show no selection option" }
    },
    required: ["useSelectedUserDataStorageIdFormContext", "disableWhenNoSelectedUserDataStorageIdFormContext"],
    additionalProperties: true
  } as const;

export const isValidSelectedUserDataStorageIdFormContext = AJV.compile<ISelectedUserDataStorageIdFormContext>(
  SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_JSON_SCHEMA
);

export const isValidSelectedUserDataStorageIdFormContextWidgetOptions = AJV.compile<ISelectedUserDataStorageIdFormContextWidgetOptions>(
  SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA
);
