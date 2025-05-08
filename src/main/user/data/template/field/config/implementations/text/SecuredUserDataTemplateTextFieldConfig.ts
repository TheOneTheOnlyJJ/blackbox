import { JSONSchemaType, ValidateFunction } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import {
  BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES,
  BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseSecuredUserDataTemplateFieldConfig
} from "../../BaseSecuredUserDataTemplateFieldConfig";

export interface ISecuredUserDataTemplateTextFieldConfig extends IBaseSecuredUserDataTemplateFieldConfig {
  type: UserDataTemplateFieldTypes["text"];
  useTextBox: boolean;
  default: string | null;
}

export const SECURED_USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_JSON_SCHEMA: JSONSchemaType<ISecuredUserDataTemplateTextFieldConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.text]
    },
    useTextBox: {
      type: "boolean"
    },
    default: {
      type: "string",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: [...BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY, "useTextBox", "default"],
  additionalProperties: false
} as const;

export const isValidSecuredUserDataTemplateTextFieldConfig: ValidateFunction<ISecuredUserDataTemplateTextFieldConfig> = AJV.compile(
  SECURED_USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_JSON_SCHEMA
);
