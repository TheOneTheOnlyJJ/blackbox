import { USER_DATA_TEMPLATE_FIELD_TYPES, UserDataTemplateFieldType } from "./UserDataTemplateFieldType";

export const USER_DATA_TEMPLATE_FIELD_TYPE_NAMES: Record<UserDataTemplateFieldType, string> = {
  [USER_DATA_TEMPLATE_FIELD_TYPES.integer]: "Integer",
  [USER_DATA_TEMPLATE_FIELD_TYPES.real]: "Real",
  [USER_DATA_TEMPLATE_FIELD_TYPES.text]: "Text"
} as const;

export type UserDataTemplateFieldTypeNames = typeof USER_DATA_TEMPLATE_FIELD_TYPE_NAMES;
export type UserDataTemplateFieldTypeName = UserDataTemplateFieldTypeNames[keyof UserDataTemplateFieldTypeNames];
