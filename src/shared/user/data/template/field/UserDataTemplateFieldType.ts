export const USER_DATA_TEMPLATE_FIELD_TYPES = {
  integer: "integer",
  real: "real",
  text: "text"
} as const;

export type UserDataTemplateFieldTypes = typeof USER_DATA_TEMPLATE_FIELD_TYPES;
export type UserDataTemplateFieldType = UserDataTemplateFieldTypes[keyof UserDataTemplateFieldTypes];
