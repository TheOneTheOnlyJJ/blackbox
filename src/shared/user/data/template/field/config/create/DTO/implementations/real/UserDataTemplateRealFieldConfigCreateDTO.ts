import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "../../../../../UserDataTemplateFieldType";
import { AJV } from "@shared/utils/AJVJSONValidator";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseUserDataTemplateFieldConfigCreateDTO
} from "../../BaseUserDataTemplateFieldConfigCreateDTO";
import {
  IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO,
  USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_DTO_JSON_SCHEMA
} from "./UserDataTemplateRealFieldNumericThresholdConfigCreateDTO";

export interface IUserDataTemplateRealFieldConfigCreateDTO extends IBaseUserDataTemplateFieldConfigCreateDTO {
  type: UserDataTemplateFieldTypes["real"];
  minimum: IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO | null;
  maximum: IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO | null;
  multipleOf: number | null;
  default: number | null;
}

export const USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateRealFieldConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_PROPERTIES.type,
      enum: [USER_DATA_TEMPLATE_FIELD_TYPES.real]
    },
    // TODO: Enforce minimum smaller than maximum
    minimum: {
      ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_DTO_JSON_SCHEMA,
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    maximum: {
      ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_DTO_JSON_SCHEMA,
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
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_REQUIRED_ARRAY, "minimum", "maximum", "multipleOf", "default"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateRealFieldConfigCreateDTO: ValidateFunction<IUserDataTemplateRealFieldConfigCreateDTO> = AJV.compile(
  USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA
);
