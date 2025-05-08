import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldType } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { JSONSchemaType } from "ajv";
import { IUserDataTemplateIntegerField, USER_DATA_TEMPLATE_INTEGER_FIELD_JSON_SCHEMA } from "./implementations/integer/UserDataTemplateIntegerField";
import { IUserDataTemplateRealField, USER_DATA_TEMPLATE_REAL_FIELD_JSON_SCHEMA } from "./implementations/real/UserDataTemplateRealField";
import { IUserDataTemplateTextField, USER_DATA_TEMPLATE_TEXT_FIELD_JSON_SCHEMA } from "./implementations/text/UserDataTemplateTextField";

export interface IUserDataTemplateFieldMap {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: IUserDataTemplateIntegerField;
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: IUserDataTemplateRealField;
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: IUserDataTemplateTextField;
}
export type UserDataTemplateField = IUserDataTemplateFieldMap[keyof IUserDataTemplateFieldMap];

type UserDataTemplateFieldJSONSchemaMap = {
  [K in UserDataTemplateFieldType]: JSONSchemaType<IUserDataTemplateFieldMap[K]>;
};
export const USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_MAP: UserDataTemplateFieldJSONSchemaMap = {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: USER_DATA_TEMPLATE_INTEGER_FIELD_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: USER_DATA_TEMPLATE_REAL_FIELD_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: USER_DATA_TEMPLATE_TEXT_FIELD_JSON_SCHEMA
} as const;

export const USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA: JSONSchemaType<UserDataTemplateField> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataTemplateField>[]>(
      (accumulator: JSONSchemaType<UserDataTemplateField>[], currentValue: string): JSONSchemaType<UserDataTemplateField>[] => {
        accumulator.push(USER_DATA_TEMPLATE_FIELD_JSON_SCHEMA_MAP[currentValue as keyof UserDataTemplateFieldJSONSchemaMap]);
        return accumulator;
      },
      []
    )
} as const;
