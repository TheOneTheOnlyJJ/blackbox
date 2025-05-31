import { USER_DATA_ENTRY_CREATE_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/entry/create/UserDataEntryCreateConstants";
import { USER_DATA_ENTRY_DATA_JSON_SCHEMA, UserDataEntryData } from "@shared/user/data/entry/UserDataEntryData";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface IUserDataEntryCreateInput {
  storageId: string;
  boxId: string;
  templateId: string;
  data: UserDataEntryData;
}

export const USER_DATA_ENTRY_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IUserDataEntryCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    storageId: { type: "string", ...USER_DATA_ENTRY_CREATE_JSON_SCHEMA_CONSTANTS.storageId },
    boxId: { type: "string", ...USER_DATA_ENTRY_CREATE_JSON_SCHEMA_CONSTANTS.boxId },
    templateId: { type: "string", ...USER_DATA_ENTRY_CREATE_JSON_SCHEMA_CONSTANTS.templateId },
    data: USER_DATA_ENTRY_DATA_JSON_SCHEMA
  },
  required: ["storageId", "boxId", "templateId", "data"],
  additionalProperties: false
} as const;

export const isValidUserDataEntryCreateDTO: ValidateFunction<IUserDataEntryCreateInput> = AJV.compile<IUserDataEntryCreateInput>(
  USER_DATA_ENTRY_CREATE_INPUT_JSON_SCHEMA
);
