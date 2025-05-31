import { USER_DATA_ENTRY_DATA_JSON_SCHEMA, UserDataEntryData } from "@shared/user/data/entry/UserDataEntryData";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { UUID } from "node:crypto";

export interface IUserDataEntry {
  entryId: UUID;
  storageId: UUID;
  boxId: UUID;
  templateId: UUID;
  data: UserDataEntryData;
}

export const USER_DATA_ENTRY_JSON_SCHEMA: JSONSchemaType<IUserDataEntry> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    entryId: { type: "string", format: "uuid" },
    storageId: { type: "string", format: "uuid" },
    boxId: { type: "string", format: "uuid" },
    templateId: { type: "string", format: "uuid" },
    data: USER_DATA_ENTRY_DATA_JSON_SCHEMA
  },
  required: ["entryId", "storageId", "boxId", "templateId", "data"],
  additionalProperties: false
} as const;

export const isValidUserDataEntry: ValidateFunction<IUserDataEntry> = AJV.compile<IUserDataEntry>(USER_DATA_ENTRY_JSON_SCHEMA);

export const isValidUserDataEntryArray = (data: unknown): data is IUserDataEntry[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataEntry => {
    return isValidUserDataEntry(value);
  });
};
