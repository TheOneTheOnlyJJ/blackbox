import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataTemplateRealFieldNumericThresholdConfig {
  value: number;
  exclusive: boolean;
}

export const USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateRealFieldNumericThresholdConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    value: { type: "number" },
    exclusive: { type: "boolean" }
  },
  required: ["value", "exclusive"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateRealFieldNumericThresholdConfig: ValidateFunction<IUserDataTemplateRealFieldNumericThresholdConfig> = AJV.compile(
  USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA
);
