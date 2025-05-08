import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataTemplateRealFieldNumericThreshold {
  value: number;
  exclusive: boolean;
}

export const USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateRealFieldNumericThreshold> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    value: { type: "number" },
    exclusive: { type: "boolean" }
  },
  required: ["value", "exclusive"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateRealFieldNumericThreshold: ValidateFunction<IUserDataTemplateRealFieldNumericThreshold> = AJV.compile(
  USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_JSON_SCHEMA
);
