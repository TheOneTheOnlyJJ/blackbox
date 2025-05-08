import { JSONSchemaType, ValidateFunction } from "ajv";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_REQUIRED_ARRAY,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  IBaseUserDataTemplateFieldConfigCreateInput
} from "../../BaseUserDataTemplateFieldConfigCreateInput";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { UiSchema } from "@rjsf/utils";
import { USER_DATA_TEMPLATE_FIELD_TYPE_NAMES } from "@shared/user/data/template/field/UserDataTemplateFieldTypeName";

export interface IUserDataTemplateTextFieldConfigCreateInput extends IBaseUserDataTemplateFieldConfigCreateInput {
  type: UserDataTemplateFieldTypes["text"];
  textUseTextBox?: boolean;
  textDefault?: string;
}

export const USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateTextFieldConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.text],
      default: USER_DATA_TEMPLATE_FIELD_TYPES.text
    },
    textUseTextBox: { type: "boolean", nullable: true },
    textDefault: { type: "string", nullable: true }
  },
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_REQUIRED_ARRAY],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateTextFieldConfigCreateInput: ValidateFunction<IUserDataTemplateTextFieldConfigCreateInput> = AJV.compile(
  USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA
);

export const USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataTemplateTextFieldConfigCreateInput> = {
  "ui:title": USER_DATA_TEMPLATE_FIELD_TYPE_NAMES.text,
  "ui:options": {
    label: false
  },
  ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  textUseTextBox: {
    "ui:title": "Use text box input"
  },
  textDefault: {
    "ui:title": "Default",
    "ui:widget": "textarea"
  }
} as const;
