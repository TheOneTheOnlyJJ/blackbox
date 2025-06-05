import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_ENTRY_DATA_JSON_SCHEMA, UserDataEntryData } from "../UserDataEntryData";

export interface IUserDataEntryInfo {
  entryId: string;
  storageId: string;
  boxId: string;
  templateId: string;
  data: UserDataEntryData;
}

export const USER_DATA_ENTRY_INFO_JSON_SCHEMA_CONSTANTS = {
  entryId: { title: "ID", format: "uuid" },
  storageId: { title: "Storage", format: "uuid" },
  boxId: { title: "Box", format: "uuid" },
  templateId: { title: "Template", format: "uuid" }
} as const;

export const USER_DATA_ENTRY_INFO_JSON_SCHEMA: JSONSchemaType<IUserDataEntryInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    entryId: { type: "string", ...USER_DATA_ENTRY_INFO_JSON_SCHEMA_CONSTANTS.entryId },
    storageId: { type: "string", ...USER_DATA_ENTRY_INFO_JSON_SCHEMA_CONSTANTS.storageId },
    boxId: { type: "string", ...USER_DATA_ENTRY_INFO_JSON_SCHEMA_CONSTANTS.boxId },
    templateId: { type: "string", ...USER_DATA_ENTRY_INFO_JSON_SCHEMA_CONSTANTS.templateId },
    data: USER_DATA_ENTRY_DATA_JSON_SCHEMA
  },
  required: ["entryId", "storageId", "boxId", "templateId", "data"],
  additionalProperties: false
} as const;

export const isValidUserDataEntryInfo: ValidateFunction<IUserDataEntryInfo> = AJV.compile<IUserDataEntryInfo>(USER_DATA_ENTRY_INFO_JSON_SCHEMA);

export const isValidUserDataEntryInfoArray = (data: unknown): data is IUserDataEntryInfo[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataEntryInfo => {
    return isValidUserDataEntryInfo(value);
  });
};
