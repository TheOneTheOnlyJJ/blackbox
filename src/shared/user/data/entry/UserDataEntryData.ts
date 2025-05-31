import { JSONSchemaType } from "ajv";
import { USER_DATA_ENTRY_FIELD_JSON_SCHEMA, UserDataEntryField } from "./field/UserDataEntryField";

export type UserDataEntryDataKey = `_${number}`; // TODO: Use this below
export type UserDataEntryData = Record<string, UserDataEntryField>;

export const USER_DATA_ENTRY_DATA_JSON_SCHEMA: JSONSchemaType<UserDataEntryData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  patternProperties: { "^_\\d+$": USER_DATA_ENTRY_FIELD_JSON_SCHEMA },
  required: [],
  additionalProperties: false
};
