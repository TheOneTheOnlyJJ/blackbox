import { USER_DATA_ENTRY_DATA_JSON_SCHEMA, UserDataEntryData } from "@shared/user/data/entry/UserDataEntryData";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IPrivateStorageSecuredUserDataEntry {
  data: UserDataEntryData;
}

export const PRIVATE_STORAGE_SECURED_USER_DATA_ENTRY_JSON_SCHEMA: JSONSchemaType<IPrivateStorageSecuredUserDataEntry> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    data: USER_DATA_ENTRY_DATA_JSON_SCHEMA
  },
  required: ["data"],
  additionalProperties: false
} as const;

export const isValidPrivateStorageSecuredUserDataEntry: ValidateFunction<IPrivateStorageSecuredUserDataEntry> = AJV.compile(
  PRIVATE_STORAGE_SECURED_USER_DATA_ENTRY_JSON_SCHEMA
);
