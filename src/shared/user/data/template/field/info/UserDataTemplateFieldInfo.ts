import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldType } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { JSONSchemaType } from "ajv";
import {
  IUserDataTemplateIntegerFieldInfo,
  USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA
} from "./implementations/integer/UserDataTemplateIntegerFieldInfo";
import { IUserDataTemplateRealFieldInfo, USER_DATA_TEMPLATE_REAL_FIELD_INFO_JSON_SCHEMA } from "./implementations/real/UserDataTemplateRealFieldInfo";
import { IUserDataTemplateTextFieldInfo, USER_DATA_TEMPLATE_TEXT_FIELD_INFO_JSON_SCHEMA } from "./implementations/text/UserDataTemplateTextFieldInfo";

export interface IUserDataTemplateFieldInfoMap {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: IUserDataTemplateIntegerFieldInfo;
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: IUserDataTemplateRealFieldInfo;
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: IUserDataTemplateTextFieldInfo;
}
export type UserDataTemplateFieldInfo = IUserDataTemplateFieldInfoMap[keyof IUserDataTemplateFieldInfoMap];

type UserDataTemplateFieldInfoJSONSchemaMap = {
  [K in UserDataTemplateFieldType]: JSONSchemaType<IUserDataTemplateFieldInfoMap[K]>;
};
export const USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_MAP: UserDataTemplateFieldInfoJSONSchemaMap = {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: USER_DATA_TEMPLATE_REAL_FIELD_INFO_JSON_SCHEMA,
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: USER_DATA_TEMPLATE_TEXT_FIELD_INFO_JSON_SCHEMA
} as const;

export const USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA: JSONSchemaType<UserDataTemplateFieldInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataTemplateFieldInfo>[]>(
      (accumulator: JSONSchemaType<UserDataTemplateFieldInfo>[], currentValue: string): JSONSchemaType<UserDataTemplateFieldInfo>[] => {
        accumulator.push(USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_MAP[currentValue as keyof UserDataTemplateFieldInfoJSONSchemaMap]);
        return accumulator;
      },
      []
    )
} as const;
