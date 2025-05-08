import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataTemplateIntegerFieldNumericThresholdInfo {
  value: number;
  exclusive: boolean;
}

export const USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS = {
  value: { title: "Value" },
  exclusive: { title: "Exclusive" }
} as const;

export const USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateIntegerFieldNumericThresholdInfo> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      value: { type: "integer", ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS.value },
      exclusive: { type: "boolean", ...USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS.exclusive }
    },
    required: ["value", "exclusive"],
    additionalProperties: false
  } as const;

export const isValidUserDataTemplateIntegerFieldNumericThresholdInfo: ValidateFunction<IUserDataTemplateIntegerFieldNumericThresholdInfo> =
  AJV.compile(USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA);
