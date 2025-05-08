import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataTemplateRealFieldNumericThresholdInfo {
  value: number;
  exclusive: boolean;
}

export const USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS = {
  value: { title: "Value" },
  exclusive: { title: "Exclusive" }
} as const;

export const USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateRealFieldNumericThresholdInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    value: { type: "number", ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS.value },
    exclusive: { type: "boolean", ...USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS.exclusive }
  },
  required: ["value", "exclusive"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateRealFieldNumericThresholdInfo: ValidateFunction<IUserDataTemplateRealFieldNumericThresholdInfo> = AJV.compile(
  USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA
);
