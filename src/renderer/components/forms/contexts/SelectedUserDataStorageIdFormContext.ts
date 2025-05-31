import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType } from "ajv";

export interface ISelectedUserDataStorageIdFormContext {
  selectedUserDataStorageId: string | undefined;
}

export interface ISelectedUserDataStorageIdFormContextWidgetOptions {
  selectedUserDataStorageIdFormContext: { use: false } | { use: true; disableWhenNoSelection: boolean };
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
      selectedUserDataStorageIdFormContext: {
        type: "object",
        required: ["use"],
        oneOf: [
          {
            type: "object",
            properties: {
              use: { const: false }
            },
            required: ["use"],
            additionalProperties: false
          },
          {
            type: "object",
            properties: {
              use: { const: true },
              disableWhenNoSelection: { type: "boolean", title: "Disable when no selection" }
            },
            required: ["use", "disableWhenNoSelection"],
            additionalProperties: false
          }
        ]
      }
    },
    required: ["selectedUserDataStorageIdFormContext"],
    additionalProperties: true
  } as const;

export const isValidSelectedUserDataStorageIdFormContext = AJV.compile<ISelectedUserDataStorageIdFormContext>(
  SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_JSON_SCHEMA
);

export const isValidSelectedUserDataStorageIdFormContextWidgetOptions = AJV.compile<ISelectedUserDataStorageIdFormContextWidgetOptions>(
  SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA
);
