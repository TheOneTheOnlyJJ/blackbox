import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_TYPES, UserDataStorageTypes } from "../../UserDataStorageType";
import { BaseUserDataStorageConfigInputData } from "../BaseUserDataStorageConfigInputData";

export interface LocalSQLiteUserDataStorageConfigInputData extends BaseUserDataStorageConfigInputData {
  type: UserDataStorageTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export const LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA: JSONSchemaType<LocalSQLiteUserDataStorageConfigInputData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_TYPES.LocalSQLite]
    },
    dbDirPath: {
      type: "string",
      minLength: 1
    },
    dbFileName: {
      type: "string",
      minLength: 1
    }
  },
  required: ["type", "dbDirPath", "dbFileName"],
  additionalProperties: false
};
