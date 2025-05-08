import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import {
  SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA,
  SecuredUserDataTemplateFieldConfig
} from "../field/config/SecuredUserDataTemplateFieldConfig";

export interface IPrivateStorageSecuredUserDataTemplateConfig {
  name: string;
  description: string | null;
  fields: SecuredUserDataTemplateFieldConfig[];
}

export const PRIVATE_STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG_JSON_SCHEMA: JSONSchemaType<IPrivateStorageSecuredUserDataTemplateConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string" },
    description: {
      type: "string",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    },
    fields: { type: "array", items: SECURED_USER_DATA_TEMPLATE_FIELD_CONFIG_JSON_SCHEMA, minItems: 1 }
  },
  required: ["name", "description", "fields"],
  additionalProperties: false
} as const;

export const isValidPrivateStorageSecuredUserDataTemplateConfig: ValidateFunction<IPrivateStorageSecuredUserDataTemplateConfig> = AJV.compile(
  PRIVATE_STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG_JSON_SCHEMA
);
