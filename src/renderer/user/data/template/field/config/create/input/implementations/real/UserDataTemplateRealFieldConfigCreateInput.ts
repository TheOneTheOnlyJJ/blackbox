import { JSONSchemaType, ValidateFunction } from "ajv";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_REQUIRED_ARRAY,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  IBaseUserDataTemplateFieldConfigCreateInput
} from "../../BaseUserDataTemplateFieldConfigCreateInput";
import {
  USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  IUserDataTemplateRealFieldNumericThresholdConfigCreateInput
} from "./UserDataTemplateRealFieldNumericThresholdConfigCreateInput";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { UiSchema } from "@rjsf/utils";
import { USER_DATA_TEMPLATE_FIELD_TYPE_NAMES } from "@shared/user/data/template/field/UserDataTemplateFieldTypeName";

export interface IUserDataTemplateRealFieldConfigCreateInput extends IBaseUserDataTemplateFieldConfigCreateInput {
  type: UserDataTemplateFieldTypes["real"];
  realMinimum?: IUserDataTemplateRealFieldNumericThresholdConfigCreateInput;
  realMaximum?: IUserDataTemplateRealFieldNumericThresholdConfigCreateInput;
  realMultipleOf?: number;
  realDefault?: number;
}

export const USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateRealFieldConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.real],
      default: USER_DATA_TEMPLATE_FIELD_TYPES.real
    },
    // TODO: Enforce minimum smaller than maximum
    realMinimum: { ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA, nullable: true },
    realMaximum: { ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA, nullable: true },
    realMultipleOf: { type: "number", nullable: true },
    realDefault: { type: "number", nullable: true }
  },
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_REQUIRED_ARRAY],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateRealFieldConfigCreateInput: ValidateFunction<IUserDataTemplateRealFieldConfigCreateInput> = AJV.compile(
  USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA
);

export const USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataTemplateRealFieldConfigCreateInput> = {
  "ui:title": USER_DATA_TEMPLATE_FIELD_TYPE_NAMES.real,
  "ui:options": {
    label: false
  },
  ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  realMinimum: {
    "ui:title": "Minimum",
    ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_UI_SCHEMA
  },
  realMaximum: {
    "ui:title": "Maximum",
    ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_UI_SCHEMA
  },
  realMultipleOf: {
    "ui:title": "Multiple of"
  },
  realDefault: {
    "ui:title": "Default"
  }
} as const;
