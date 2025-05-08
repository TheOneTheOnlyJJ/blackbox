import { UserDataTemplateFieldType } from "@shared/user/data/template/field/UserDataTemplateFieldType";

export interface IBaseSecuredUserDataTemplateFieldConfig {
  type: UserDataTemplateFieldType;
  name: string;
  description: string | null;
}

export const BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES = {
  type: { type: "string" },
  name: { type: "string" },
  description: {
    type: "string",
    nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
  }
} as const;

export const BASE_SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY = ["type", "name", "description"] as const;
