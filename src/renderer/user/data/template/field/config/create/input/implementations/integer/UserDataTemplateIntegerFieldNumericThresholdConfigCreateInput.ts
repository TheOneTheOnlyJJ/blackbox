import { UiSchema } from "@rjsf/utils";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataTemplateIntegerFieldNumericThresholdConfigCreateInput {
  integerValue?: number; // int
  integerExclusive?: boolean;
}

export const USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateIntegerFieldNumericThresholdConfigCreateInput> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      integerValue: { type: "integer", nullable: true },
      integerExclusive: { type: "boolean", nullable: true }
    },
    required: [],
    additionalProperties: false
  } as const;

export const isValidUserDataTemplateIntegerFieldNumericThresholdConfigCreateInput: ValidateFunction<IUserDataTemplateIntegerFieldNumericThresholdConfigCreateInput> =
  AJV.compile(USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA);

export const USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema = {
  integerValue: {
    "ui:title": "Value"
  },
  integerExclusive: {
    "ui:title": "Exclusive?"
  }
} as const;
