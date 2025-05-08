import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface ISecuredUserDataTemplateIntegerFieldNumericThresholdConfig {
  value: number;
  exclusive: boolean;
}

export const SECURED_USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA: JSONSchemaType<ISecuredUserDataTemplateIntegerFieldNumericThresholdConfig> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      value: { type: "integer" },
      exclusive: { type: "boolean" }
    },
    required: ["value", "exclusive"],
    additionalProperties: false
  } as const;

export const isValidSecuredUserDataTemplateIntegerFieldNumericThresholdConfig: ValidateFunction<ISecuredUserDataTemplateIntegerFieldNumericThresholdConfig> =
  AJV.compile(SECURED_USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_JSON_SCHEMA);
