import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType } from "ajv";

export interface ISelectedUserDataBoxIdFormContext {
  selectedUserDataBoxId: string | undefined;
}

export interface ISelectedUserDataBoxIdFormContextWidgetOptions {
  selectedUserDataBoxIdFormContext: { use: false } | { use: true; disableWhenNoSelection: boolean };
}

export const SELECTED_USER_DATA_BOX_ID_FORM_CONTEXT_JSON_SCHEMA: JSONSchemaType<ISelectedUserDataBoxIdFormContext> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    selectedUserDataBoxId: { type: "string", format: "uuid", title: "Selected User Data Box ID", nullable: true }
  },
  additionalProperties: true
} as const;

export const SELECTED_USER_DATA_BOX_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA: JSONSchemaType<ISelectedUserDataBoxIdFormContextWidgetOptions> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    selectedUserDataBoxIdFormContext: {
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
  required: ["selectedUserDataBoxIdFormContext"],
  additionalProperties: true
} as const;

export const isValidSelectedUserDataBoxIdFormContext = AJV.compile<ISelectedUserDataBoxIdFormContext>(
  SELECTED_USER_DATA_BOX_ID_FORM_CONTEXT_JSON_SCHEMA
);

export const isValidSelectedUserDataBoxIdFormContextWidgetOptions = AJV.compile<ISelectedUserDataBoxIdFormContextWidgetOptions>(
  SELECTED_USER_DATA_BOX_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA
);
