import { JSONSchemaType, ValidateFunction } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { USER_DATA_ENTRY_CREATE_JSON_SCHEMA_CONSTANTS } from "../UserDataEntryCreateConstants";
import { USER_DATA_ENTRY_DATA_JSON_SCHEMA, UserDataEntryData } from "../../UserDataEntryData";

export interface IUserDataEntryCreateDTO {
  storageId: string;
  boxId: string;
  templateId: string;
  data: UserDataEntryData;
}

export const USER_DATA_ENTRY_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataEntryCreateDTO> = {
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

export const isValidUserDataEntryCreateDTO: ValidateFunction<IUserDataEntryCreateDTO> = AJV.compile<IUserDataEntryCreateDTO>(
  USER_DATA_ENTRY_CREATE_DTO_JSON_SCHEMA
);
