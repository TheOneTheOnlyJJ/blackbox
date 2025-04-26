import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "./UserDataTemplateConfigCreateConstants";

export interface IUserDataTemplateNameAvailabilityRequest {
  name: string;
  boxId: string;
  storageId: string;
}

export const USER_DATA_TEMPLATE_NAME_AVAILABILITY_REQUEST_JSON_SCHEMA: JSONSchemaType<IUserDataTemplateNameAvailabilityRequest> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name },
    boxId: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.boxId },
    storageId: { type: "string", ...USER_DATA_TEMPLATE_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.storageId }
  },
  required: ["name", "boxId", "storageId"],
  additionalProperties: false
} as const;

export const isValidUserDataTemplateNameAvailabilityRequest: ValidateFunction<IUserDataTemplateNameAvailabilityRequest> = AJV.compile(
  USER_DATA_TEMPLATE_NAME_AVAILABILITY_REQUEST_JSON_SCHEMA
);
