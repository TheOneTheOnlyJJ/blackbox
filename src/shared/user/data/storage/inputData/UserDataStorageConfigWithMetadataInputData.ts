import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_CONFIG_INPUT_DATA_JSON_SCHEMA, UserDataStorageConfigInputData } from "./UserDataStorageConfigInputData";

export interface IUserDataStorageConfigWithMetadataInputData {
  name: string;
  config: UserDataStorageConfigInputData;
}

export const USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_JSON_SCHEMA: JSONSchemaType<IUserDataStorageConfigWithMetadataInputData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: { type: "string" },
    config: USER_DATA_STORAGE_CONFIG_INPUT_DATA_JSON_SCHEMA
  },
  required: ["name", "config"],
  additionalProperties: false
} as const;
