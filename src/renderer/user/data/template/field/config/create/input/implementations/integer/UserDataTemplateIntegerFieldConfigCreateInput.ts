import { JSONSchemaType, ValidateFunction } from "ajv";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_REQUIRED_ARRAY,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  IBaseUserDataTemplateFieldConfigCreateInput
} from "../../BaseUserDataTemplateFieldConfigCreateInput";
import {
  USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  IUserDataTemplateIntegerFieldNumericThresholdConfigCreateInput
} from "./UserDataTemplateIntegerFieldNumericThresholdConfigCreateInput";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { UiSchema } from "@rjsf/utils";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { USER_DATA_TEMPLATE_FIELD_TYPE_NAMES } from "@shared/user/data/template/field/UserDataTemplateFieldTypeName";

export interface IUserDataTemplateIntegerFieldConfigCreateInput extends IBaseUserDataTemplateFieldConfigCreateInput {
  type: UserDataTemplateFieldTypes["integer"];
  integerMinimum?: IUserDataTemplateIntegerFieldNumericThresholdConfigCreateInput;
  integerMaximum?: IUserDataTemplateIntegerFieldNumericThresholdConfigCreateInput;
  integerMultipleOf?: number;
  integerDefault?: number;
}

export const USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateIntegerFieldConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.integer],
      default: USER_DATA_TEMPLATE_FIELD_TYPES.integer
    },
    // TODO: Enforce minimum smaller than maximum
    integerMinimum: { ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA, nullable: true },
    integerMaximum: { ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA, nullable: true },
    integerMultipleOf: { type: "integer", nullable: true },
    integerDefault: { type: "integer", nullable: true }
  },
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_REQUIRED_ARRAY],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateIntegerFieldConfigCreateInput: ValidateFunction<IUserDataTemplateIntegerFieldConfigCreateInput> = AJV.compile(
  USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA
);

export const USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataTemplateIntegerFieldConfigCreateInput> = {
  "ui:title": USER_DATA_TEMPLATE_FIELD_TYPE_NAMES.integer,
  "ui:options": {
    label: false
  },
  ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  integerMinimum: {
    "ui:title": "Minimum",
    ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_UI_SCHEMA
  },
  integerMaximum: {
    "ui:title": "Maximum",
    ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_UI_SCHEMA
  },
  integerMultipleOf: {
    "ui:title": "Multiple of"
  },
  integerDefault: {
    "ui:title": "Default"
  }
} as const;
