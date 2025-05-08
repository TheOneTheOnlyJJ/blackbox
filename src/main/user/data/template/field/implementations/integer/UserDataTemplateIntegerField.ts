import { JSONSchemaType, ValidateFunction } from "ajv";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseUserDataTemplateField
} from "../../BaseUserDataTemplateField";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { AJV } from "@shared/utils/AJVJSONValidator";
import {
  IUserDataTemplateIntegerFieldNumericThreshold,
  USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_JSON_SCHEMA
} from "./UserDataTemplateIntegerFieldNumericThreshold";

export interface IUserDataTemplateIntegerField extends IBaseUserDataTemplateField {
  type: UserDataTemplateFieldTypes["integer"];
  minimum: IUserDataTemplateIntegerFieldNumericThreshold | null;
  maximum: IUserDataTemplateIntegerFieldNumericThreshold | null;
  multipleOf: number | null;
  default: number | null;
}

export const USER_DATA_TEMPLATE_INTEGER_FIELD_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateIntegerField> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.integer]
    },
    // TODO: Enforce minimum smaller than maximum
    minimum: {
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    maximum: {
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_JSON_SCHEMA,
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
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_REQUIRED_ARRAY, "minimum", "maximum", "multipleOf", "default"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateIntegerField: ValidateFunction<IUserDataTemplateIntegerField> = AJV.compile(
  USER_DATA_TEMPLATE_INTEGER_FIELD_JSON_SCHEMA
);
