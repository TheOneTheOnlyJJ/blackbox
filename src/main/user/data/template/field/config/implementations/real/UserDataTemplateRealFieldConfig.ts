import { JSONSchemaType, ValidateFunction } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseUserDataTemplateFieldConfig
} from "../../BaseUserDataTemplateFieldConfig";
import {
  IUserDataTemplateRealFieldNumericThresholdConfig,
  USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA
} from "./UserDataTemplateRealFieldNumericThresholdConfig";

export interface IUserDataTemplateRealFieldConfig extends IBaseUserDataTemplateFieldConfig {
  type: UserDataTemplateFieldTypes["real"];
  minimum: IUserDataTemplateRealFieldNumericThresholdConfig | null;
  maximum: IUserDataTemplateRealFieldNumericThresholdConfig | null;
  multipleOf: number | null;
  default: number | null;
}

export const USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateRealFieldConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.real]
    },
    // TODO: Enforce minimum smaller than maximum
    minimum: {
      ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    maximum: {
      ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA,
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
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY, "minimum", "maximum", "multipleOf", "default"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateRealFieldConfig: ValidateFunction<IUserDataTemplateRealFieldConfig> = AJV.compile(
  USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_JSON_SCHEMA
);
