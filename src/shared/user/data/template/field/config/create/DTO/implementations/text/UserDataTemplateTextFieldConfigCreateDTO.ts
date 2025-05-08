import { JSONSchemaType, ValidateFunction } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldTypes } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import {
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_PROPERTIES,
  BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_REQUIRED_ARRAY,
  IBaseUserDataTemplateFieldConfigCreateDTO
} from "../../BaseUserDataTemplateFieldConfigCreateDTO";

export interface IUserDataTemplateTextFieldConfigCreateDTO extends IBaseUserDataTemplateFieldConfigCreateDTO {
  type: UserDataTemplateFieldTypes["text"];
  useTextBox: boolean;
  default: string | null;
}

export const USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateTextFieldConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_PROPERTIES,
    type: {
      ...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_PROPERTIES.type,
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
  required: [...BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA_REQUIRED_ARRAY, "useTextBox", "default"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateTextFieldConfigCreateDTO: ValidateFunction<IUserDataTemplateTextFieldConfigCreateDTO> = AJV.compile(
  USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_DTO_JSON_SCHEMA
);
