import { JSONSchemaType } from "ajv";
import {
  IUserDataStorageConfigWithMetadataInputData,
  USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_JSON_SCHEMA
} from "./inputData/UserDataStorageConfigWithMetadataInputData";

export interface INewUserDataStorageConfigWithMetadataDTO {
  userId: string;
  userDataStorageConfigWithMetadataInputData: IUserDataStorageConfigWithMetadataInputData;
}

export const NEW_USER_DATA_STORAGE_CONFIG_WITH_METADATA_DTO_JSON_SCHEMA: JSONSchemaType<INewUserDataStorageConfigWithMetadataDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    userId: { type: "string", format: "uuid" },
    userDataStorageConfigWithMetadataInputData: USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_JSON_SCHEMA
  },
  required: ["userId", "userDataStorageConfigWithMetadataInputData"],
  additionalProperties: false
} as const;
