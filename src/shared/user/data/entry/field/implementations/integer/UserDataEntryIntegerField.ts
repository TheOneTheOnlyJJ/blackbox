import { JSONSchemaType } from "ajv";

export type UserDataEntryIntegerField = number;

export const USER_DATA_ENTRY_INTEGER_FIELD_JSON_SCHEMA: JSONSchemaType<UserDataEntryIntegerField> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "integer"
} as const;
