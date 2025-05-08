import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { AJV } from "@shared/utils/AJVJSONValidator";
import {
  BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES,
  BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseSecuredUserDataTemplateFieldConfig
} from "../../BaseSecuredUserDataTemplateFieldConfig";
import {
  ISecuredUserDataTemplateIntegerFieldNumericThresholdConfig,
  SECURED_USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA
} from "./SecuredUserDataTemplateIntegerFieldNumericThresholdConfig";

export interface ISecuredUserDataTemplateIntegerFieldConfig extends IBaseSecuredUserDataTemplateFieldConfig {
  type: UserDataTemplateFieldTypes["integer"];
  minimum: ISecuredUserDataTemplateIntegerFieldNumericThresholdConfig | null;
  maximum: ISecuredUserDataTemplateIntegerFieldNumericThresholdConfig | null;
  multipleOf: number | null;
  default: number | null;
}

export const SECURED_USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_JSON_SCHEMA: JSONSchemaType<ISecuredUserDataTemplateIntegerFieldConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.integer]
    },
    // TODO: Enforce minimum smaller than maximum
    minimum: {
      ...SECURED_USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    maximum: {
      ...SECURED_USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    multipleOf: {
      type: "integer",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    default: {
      type: "integer",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: [...BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY, "minimum", "maximum", "multipleOf", "default"],
  additionalProperties: false
} as const;

export const isValidSecuredUserDataTemplateIntegerFieldConfig: ValidateFunction<ISecuredUserDataTemplateIntegerFieldConfig> = AJV.compile(
  SECURED_USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_JSON_SCHEMA
);
