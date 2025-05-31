import { JSONSchemaType } from "ajv";

export type UserDataEntryTextField = string;

export const USER_DATA_ENTRY_TEXT_FIELD_JSON_SCHEMA: JSONSchemaType<UserDataEntryTextField> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "string"
} as const;
