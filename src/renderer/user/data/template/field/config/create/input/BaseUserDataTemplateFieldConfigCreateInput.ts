import { UiSchema } from "@rjsf/utils";
import { UserDataTemplateFieldType } from "@shared/user/data/template/field/UserDataTemplateFieldType";

export interface IBaseUserDataTemplateFieldConfigCreateInput {
  type: UserDataTemplateFieldType;
  name: string;
  description?: string;
  isRequired?: boolean;
}

export const BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_PROPERTIES = {
  type: { type: "string" },
  name: { type: "string" },
  description: { type: "string", nullable: true },
  isRequired: { type: "boolean", nullable: true }
} as const;

export const BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_JSON_SCHEMA_REQUIRED_ARRAY = ["type", "name"] as const;

export const BASE_USER_DATA_TEMPLATE_FIELD_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema = {
  type: {
    "ui:widget": "hidden"
  },
  name: {
    "ui:title": "Name"
  },
  description: {
    "ui:title": "Description"
  },
  isRequired: {
    "ui:title": "Required"
  }
} as const;
