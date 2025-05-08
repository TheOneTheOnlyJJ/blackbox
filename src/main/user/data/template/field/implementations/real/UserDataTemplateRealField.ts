import { JSONSchemaType, ValidateFunction } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseUserDataTemplateField
} from "../../BaseUserDataTemplateField";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import {
  IUserDataTemplateRealFieldNumericThreshold,
  USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_JSON_SCHEMA
} from "./UserDataTemplateRealFieldNumericThreshold";

export interface IUserDataTemplateRealField extends IBaseUserDataTemplateField {
  type: UserDataTemplateFieldTypes["real"];
  minimum: IUserDataTemplateRealFieldNumericThreshold | null;
  maximum: IUserDataTemplateRealFieldNumericThreshold | null;
  multipleOf: number | null;
  default: number | null;
}

export const USER_DATA_TEMPLATE_REAL_FIELD_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateRealField> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.real]
    },
    // TODO: Enforce minimum smaller than maximum
    minimum: {
      ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    maximum: {
      ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_JSON_SCHEMA,
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
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_REQUIRED_ARRAY, "minimum", "maximum", "multipleOf", "default"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateRealField: ValidateFunction<IUserDataTemplateRealField> = AJV.compile(USER_DATA_TEMPLATE_REAL_FIELD_JSON_SCHEMA);
