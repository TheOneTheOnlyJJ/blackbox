import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IPrivateStorageSecuredUserDataBoxConfig {
  name: string;
  description: string | null;
}

export const PRIVATE_STORAGE_SECURED_USER_DATA_BOX_CONFIG_JSON_SCHEMA: JSONSchemaType<IPrivateStorageSecuredUserDataBoxConfig> = {
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

export const isValidPrivateStorageSecuredUserDataBoxConfig: ValidateFunction<IPrivateStorageSecuredUserDataBoxConfig> = AJV.compile(
  PRIVATE_STORAGE_SECURED_USER_DATA_BOX_CONFIG_JSON_SCHEMA
);
