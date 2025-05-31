import { UserDataTemplateFieldType } from "@shared/user/data/template/field/UserDataTemplateFieldType";

export interface IBaseUserDataTemplateFieldConfig {
  type: UserDataTemplateFieldType;
  name: string;
  description: string | null;
  isRequired: boolean;
}

export const BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_PROPERTIES = {
  type: { type: "string" },
  name: { type: "string" },
  description: {
    type: "string",
    nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
  },
  isRequired: { type: "boolean" }
} as const;

export const BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA_REQUIRED_ARRAY = ["type", "name", "description", "isRequired"] as const;
