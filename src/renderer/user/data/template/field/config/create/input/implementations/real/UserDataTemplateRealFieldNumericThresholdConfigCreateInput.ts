import { UiSchema } from "@rjsf/utils";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataTemplateRealFieldNumericThresholdConfigCreateInput {
  realValue?: number;
  realExclusive?: boolean;
}

export const USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateRealFieldNumericThresholdConfigCreateInput> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      realValue: { type: "number", nullable: true },
      realExclusive: { type: "boolean", nullable: true }
    },
    required: [],
    additionalProperties: false
  } as const;

export const isValidUserDataTemplateRealFieldNumericThresholdConfigCreateInput: ValidateFunction<IUserDataTemplateRealFieldNumericThresholdConfigCreateInput> =
  AJV.compile(USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_JSON_SCHEMA);

export const USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema = {
  realValue: {
    "ui:title": "Value"
  },
  realExclusive: {
    "ui:title": "Exclusive?"
  }
} as const;
