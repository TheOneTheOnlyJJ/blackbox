import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IPrivateStorageSecuredUserDataTemplateConfig {
  name: string;
  description: string | null;
}

export const PRIVATE_STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG_JSON_SCHEMA: JSONSchemaType<IPrivateStorageSecuredUserDataTemplateConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string" },
    description: {
      type: "string",
      nullable: true as false // https://github.com/ajv-validator/ajv/issues/2163#issuecomment-2085689455
    }
  },
  required: ["name", "description"],
  additionalProperties: false
} as const;

export const isValidPrivateStorageSecuredUserDataTemplateConfig: ValidateFunction<IPrivateStorageSecuredUserDataTemplateConfig> = AJV.compile(
  PRIVATE_STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG_JSON_SCHEMA
);
