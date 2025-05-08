import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { AJV } from "@shared/utils/AJVJSONValidator";
import {
  IUserDataTemplateIntegerFieldNumericThresholdInfo,
  USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA
} from "./UserDataTemplateIntegerFieldNumericThresholdInfo";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseUserDataTemplateFieldInfo
} from "../../BaseUserDataTemplateFieldInfo";

export interface IUserDataTemplateIntegerFieldInfo extends IBaseUserDataTemplateFieldInfo {
  type: UserDataTemplateFieldTypes["integer"];
  minimum: IUserDataTemplateIntegerFieldNumericThresholdInfo | null;
  maximum: IUserDataTemplateIntegerFieldNumericThresholdInfo | null;
  multipleOf: number | null;
  default: number | null;
}

export const USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS = {
  minimum: { title: "Minimum" },
  maximum: { title: "Maximum" },
  multipleOf: { title: "Multiple of" },
  default: { title: "Default" }
} as const;

export const USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateIntegerFieldInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.integer]
    },
    // TODO: Enforce minimum smaller than maximum
    minimum: {
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA,
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS.minimum,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    maximum: {
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA,
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS.maximum,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    multipleOf: {
      type: "integer",
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS.multipleOf,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    default: {
      type: "integer",
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS.default,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_REQUIRED_ARRAY, "minimum", "maximum", "multipleOf", "default"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateIntegerFieldInfo: ValidateFunction<IUserDataTemplateIntegerFieldInfo> = AJV.compile(
  USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA
);
