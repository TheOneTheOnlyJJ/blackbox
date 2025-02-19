import { JSONSchemaType } from "ajv";
import { IUserDataStorageConfigCreateInput, USER_DATA_STORAGE_CONFIG_CREATE_INPUT_JSON_SCHEMA } from "./UserDataStorageConfigCreateInput";

export interface IUserDataStorageConfigCreateDTO {
  userId: string;
  // TODO: Make this a DTO aswell?
  userDataStorageConfigCreateInput: IUserDataStorageConfigCreateInput; // TODO: Make this its own DTO and add transforms from Input to DTO
}

export const USER_DATA_STORAGE_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string", format: "uuid" },
    userDataStorageConfigCreateInput: USER_DATA_STORAGE_CONFIG_CREATE_INPUT_JSON_SCHEMA
  },
  required: ["userId", "userDataStorageConfigCreateInput"],
  additionalProperties: false
} as const;
