import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS } from "./UserDataBoxConfigCreateConstants";

export interface IUserDataBoxNameAvailabilityRequest {
  name: string;
  storageId: string;
}

export const USER_DATA_BOX_NAME_AVAILABILITY_REQUEST_JSON_SCHEMA: JSONSchemaType<IUserDataBoxNameAvailabilityRequest> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", ...USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.storageId },
    name: { type: "string", ...USER_DATA_BOX_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS.name }
  },
  required: ["name", "storageId"],
  additionalProperties: false
} as const;

export const isValidUserDataBoxNameAvailabilityRequest: ValidateFunction<IUserDataBoxNameAvailabilityRequest> = AJV.compile(
  USER_DATA_BOX_NAME_AVAILABILITY_REQUEST_JSON_SCHEMA
);
