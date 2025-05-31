import { JSONSchemaType } from "ajv";
import { USER_DATA_ENTRY_INTEGER_FIELD_JSON_SCHEMA, UserDataEntryIntegerField } from "./implementations/integer/UserDataEntryIntegerField";
import { USER_DATA_ENTRY_REAL_FIELD_JSON_SCHEMA, UserDataEntryRealField } from "./implementations/real/UserDataEntryRealField";
import { USER_DATA_ENTRY_TEXT_FIELD_JSON_SCHEMA, UserDataEntryTextField } from "./implementations/text/UserDataEntryTextField";
import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldType } from "../../template/field/UserDataTemplateFieldType";

export interface IUserDataEntryFieldMap {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: UserDataEntryIntegerField;
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: UserDataEntryRealField;
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: UserDataEntryTextField;
}
export type UserDataEntryField = IUserDataEntryFieldMap[keyof IUserDataEntryFieldMap];

type UserDataEntryFieldJSONSchemaMap = {
  [K in UserDataTemplateFieldType]: JSONSchemaType<IUserDataEntryFieldMap[K]>;
};
export const USER_DATA_ENTRY_FIELD_JSON_SCHEMA_MAP: UserDataEntryFieldJSONSchemaMap = {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: USER_DATA_ENTRY_INTEGER_FIELD_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: USER_DATA_ENTRY_REAL_FIELD_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: USER_DATA_ENTRY_TEXT_FIELD_JSON_SCHEMA
} as const;

export const USER_DATA_ENTRY_FIELD_JSON_SCHEMA: JSONSchemaType<UserDataEntryField> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_ENTRY_FIELD_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataEntryField>[]>(
      (accumulator: JSONSchemaType<UserDataEntryField>[], currentValue: string): JSONSchemaType<UserDataEntryField>[] => {
        accumulator.push(USER_DATA_ENTRY_FIELD_JSON_SCHEMA_MAP[currentValue as keyof UserDataEntryFieldJSONSchemaMap]);
        return accumulator;
      },
      []
    )
} as const;
