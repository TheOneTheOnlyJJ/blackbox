import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO {
  value: number;
  exclusive: boolean;
}

export const USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      value: { type: "number" },
      exclusive: { type: "boolean" }
    },
    required: ["value", "exclusive"],
    additionalProperties: false
  } as const;

export const isValidUserDataTemplateRealFieldNumericThresholdConfigCreateDTO: ValidateFunction<IUserDataTemplateRealFieldNumericThresholdConfigCreateDTO> =
  AJV.compile(USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_CONFIG_CREATE_DTO_JSON_SCHEMA);
