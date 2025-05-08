import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "../../../../../UserDataTemplateFieldType";
import {
  IUserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO,
  USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_DTO_JSON_SCHEMA
} from "./UserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO";
import { AJV } from "@shared/utils/AJVJSONValidator";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseUserDataTemplateFieldConfigCreateDTO
} from "../../BaseUserDataTemplateFieldConfigCreateDTO";

export interface IUserDataTemplateIntegerFieldConfigCreateDTO extends IBaseUserDataTemplateFieldConfigCreateDTO {
  type: UserDataTemplateFieldTypes["integer"];
  minimum: IUserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO | null;
  maximum: IUserDataTemplateIntegerFieldNumericThresholdConfigCreateDTO | null;
  multipleOf: number | null;
  default: number | null;
}

export const USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateIntegerFieldConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.integer]
    },
    // TODO: Enforce minimum smaller than maximum
    minimum: {
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_DTO_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    maximum: {
      ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_DTO_JSON_SCHEMA,
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
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_REQUIRED_ARRAY, "minimum", "maximum", "multipleOf", "default"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateIntegerFieldConfigCreateDTO: ValidateFunction<IUserDataTemplateIntegerFieldConfigCreateDTO> = AJV.compile(
  USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA
);
