import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldType } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { JSONSchemaType } from "ajv";
import {
  IUserDataTemplateIntegerFieldConfig,
  USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_JSON_SCHEMA
} from "./implementations/integer/UserDataTemplateIntegerFieldConfig";
import {
  IUserDataTemplateRealFieldConfig,
  USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_JSON_SCHEMA
} from "./implementations/real/UserDataTemplateRealFieldConfig";
import {
  IUserDataTemplateTextFieldConfig,
  USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_JSON_SCHEMA
} from "./implementations/text/UserDataTemplateTextFieldConfig";

export interface IUserDataTemplateFieldConfigMap {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: IUserDataTemplateIntegerFieldConfig;
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: IUserDataTemplateRealFieldConfig;
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: IUserDataTemplateTextFieldConfig;
}
export type UserDataTemplateFieldConfig = IUserDataTemplateFieldConfigMap[keyof IUserDataTemplateFieldConfigMap];

type UserDataTemplateFieldConfigJSONSchemaMap = {
  [K in UserDataTemplateFieldType]: JSONSchemaType<IUserDataTemplateFieldConfigMap[K]>;
};
export const USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_MAP: UserDataTemplateFieldConfigJSONSchemaMap = {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_JSON_SCHEMA
} as const;

export const USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA: JSONSchemaType<UserDataTemplateFieldConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataTemplateFieldConfig>[]>(
      (accumulator: JSONSchemaType<UserDataTemplateFieldConfig>[], currentValue: string): JSONSchemaType<UserDataTemplateFieldConfig>[] => {
        accumulator.push(USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_MAP[currentValue as keyof UserDataTemplateFieldConfigJSONSchemaMap]);
        return accumulator;
      },
      []
    )
} as const;
