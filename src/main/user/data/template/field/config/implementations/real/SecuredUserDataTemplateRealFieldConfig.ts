import { JSONSchemaType, ValidateFunction } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import {
  ISecuredUserDataTemplateRealFieldNumericThresholdConfig,
  SECURED_USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA
} from "./SecuredUserDataTemplateRealFieldNumericThresholdConfig";
import {
  BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES,
  BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseSecuredUserDataTemplateFieldConfig
} from "../../BaseSecuredUserDataTemplateFieldConfig";

export interface ISecuredUserDataTemplateRealFieldConfig extends IBaseSecuredUserDataTemplateFieldConfig {
  type: UserDataTemplateFieldTypes["real"];
  minimum: ISecuredUserDataTemplateRealFieldNumericThresholdConfig | null;
  maximum: ISecuredUserDataTemplateRealFieldNumericThresholdConfig | null;
  multipleOf: number | null;
  default: number | null;
}

export const SECURED_USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_JSON_SCHEMA: JSONSchemaType<ISecuredUserDataTemplateRealFieldConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.real]
    },
    // TODO: Enforce minimum smaller than maximum
    minimum: {
      ...SECURED_USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    maximum: {
      ...SECURED_USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    multipleOf: {
      type: "number",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    default: {
      type: "number",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: [...BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY, "minimum", "maximum", "multipleOf", "default"],
  additionalProperties: false
} as const;

export const isValidSecuredUserDataTemplateRealFieldConfig: ValidateFunction<ISecuredUserDataTemplateRealFieldConfig> = AJV.compile(
  SECURED_USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_JSON_SCHEMA
);
