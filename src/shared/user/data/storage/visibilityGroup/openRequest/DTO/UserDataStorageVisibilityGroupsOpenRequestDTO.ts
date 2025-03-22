import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataStorageVisibilityGroupsOpenRequestDTO {
  userIdToOpenFor: string;
  password: string;
}

export const USER_DATA_STORAGE_VISIBILITY_GROUPS_OPEN_REQUEST_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageVisibilityGroupsOpenRequestDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userIdToOpenFor: { type: "string", title: "User ID To Open For" },
    password: { type: "string", title: "Password" }
  },
  required: ["userIdToOpenFor", "password"],
  additionalProperties: false
} as const;

export const isValidUserDataStorageVisibilityGroupsOpenRequestDTO: ValidateFunction<IUserDataStorageVisibilityGroupsOpenRequestDTO> = AJV.compile(
  USER_DATA_STORAGE_VISIBILITY_GROUPS_OPEN_REQUEST_DTO_JSON_SCHEMA
);
