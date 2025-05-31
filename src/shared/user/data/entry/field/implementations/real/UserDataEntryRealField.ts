import { JSONSchemaType } from "ajv";

export type UserDataEntryRealField = number;

export const USER_DATA_ENTRY_REAL_FIELD_JSON_SCHEMA: JSONSchemaType<UserDataEntryRealField> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "number"
} as const;
