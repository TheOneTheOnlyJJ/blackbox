import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldType } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { JSONSchemaType } from "ajv";
import {
  ISecuredUserDataTemplateIntegerFieldConfig,
  SECURED_USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_JSON_SCHEMA
} from "./implementations/integer/SecuredUserDataTemplateIntegerFieldConfig";
import {
  ISecuredUserDataTemplateRealFieldConfig,
  SECURED_USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_JSON_SCHEMA
} from "./implementations/real/SecuredUserDataTemplateRealFieldConfig";
import {
  ISecuredUserDataTemplateTextFieldConfig,
  SECURED_USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_JSON_SCHEMA
} from "./implementations/text/SecuredUserDataTemplateTextFieldConfig";

export interface ISecuredUserDataTemplateFieldConfigMap {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: ISecuredUserDataTemplateIntegerFieldConfig;
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: ISecuredUserDataTemplateRealFieldConfig;
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: ISecuredUserDataTemplateTextFieldConfig;
}
export type SecuredUserDataTemplateFieldConfig = ISecuredUserDataTemplateFieldConfigMap[keyof ISecuredUserDataTemplateFieldConfigMap];

type SecuredUserDataTemplateFieldConfigJSONSchemaMap = {
  [K in UserDataTemplateFieldType]: JSONSchemaType<ISecuredUserDataTemplateFieldConfigMap[K]>;
};
export const SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_MAP: SecuredUserDataTemplateFieldConfigJSONSchemaMap = {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: SECURED_USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: SECURED_USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: SECURED_USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_JSON_SCHEMA
} as const;

export const SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA: JSONSchemaType<SecuredUserDataTemplateFieldConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<SecuredUserDataTemplateFieldConfig>[]>(
      (
        accumulator: JSONSchemaType<SecuredUserDataTemplateFieldConfig>[],
        currentValue: string
      ): JSONSchemaType<SecuredUserDataTemplateFieldConfig>[] => {
        accumulator.push(
          SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_MAP[currentValue as keyof SecuredUserDataTemplateFieldConfigJSONSchemaMap]
        );
        return accumulator;
      },
      []
    )
} as const;
