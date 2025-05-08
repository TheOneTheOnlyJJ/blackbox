import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldType } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import {
  IUserDataTemplateIntegerFieldConfigCreateInput,
  USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "./implementations/integer/UserDataTemplateIntegerFieldConfigCreateInput";
import {
  IUserDataTemplateRealFieldConfigCreateInput,
  USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "./implementations/real/UserDataTemplateRealFieldConfigCreateInput";
import {
  IUserDataTemplateTextFieldConfigCreateInput,
  USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "./implementations/text/UserDataTemplateTextFieldConfigCreateInput";
import { JSONSchemaType } from "ajv";
import { UiSchema } from "@rjsf/utils";

export interface IUserDataTemplateFieldConfigCreateInputMap {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: IUserDataTemplateIntegerFieldConfigCreateInput;
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: IUserDataTemplateRealFieldConfigCreateInput;
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: IUserDataTemplateTextFieldConfigCreateInput;
}
export type UserDataTemplateFieldConfigCreateInput = IUserDataTemplateFieldConfigCreateInputMap[keyof IUserDataTemplateFieldConfigCreateInputMap];

type UserDataTemplateFieldConfigCreateInputJSONSchemaMap = {
  [K in UserDataTemplateFieldType]: JSONSchemaType<IUserDataTemplateFieldConfigCreateInputMap[K]>;
};
export const USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP: UserDataTemplateFieldConfigCreateInputJSONSchemaMap = {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA
} as const;

export const USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<UserDataTemplateFieldConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataTemplateFieldConfigCreateInput>[]>(
      (
        accumulator: JSONSchemaType<UserDataTemplateFieldConfigCreateInput>[],
        currentValue: string
      ): JSONSchemaType<UserDataTemplateFieldConfigCreateInput>[] => {
        accumulator.push(
          USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP[currentValue as keyof UserDataTemplateFieldConfigCreateInputJSONSchemaMap]
        );
        return accumulator;
      },
      []
    )
} as const;

type UserDataTemplateFieldConfigCreateInputUiSchemaMap = {
  [K in UserDataTemplateFieldType]: UiSchema<IUserDataTemplateFieldConfigCreateInputMap[K]>;
};
export const USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA_MAP: UserDataTemplateFieldConfigCreateInputUiSchemaMap = {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: USER_DATA_TEMPLATE_INTEGER_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: USER_DATA_TEMPLATE_REAL_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: USER_DATA_TEMPLATE_TEXT_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA
} as const;

export const USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<UserDataTemplateFieldConfigCreateInput> = {
  "ui:title": "Field Type",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA_MAP)
    .sort()
    .reduce<UiSchema<UserDataTemplateFieldConfigCreateInput>[]>(
      (accumulator: UiSchema<UserDataTemplateFieldConfigCreateInput>[], currentValue: string): UiSchema<UserDataTemplateFieldConfigCreateInput>[] => {
        accumulator.push(
          USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA_MAP[
            currentValue as keyof UserDataTemplateFieldConfigCreateInputUiSchemaMap
          ] as UiSchema<UserDataTemplateFieldConfigCreateInput> // Apparently this is required here
        );
        return accumulator;
      },
      []
    )
} as const;
