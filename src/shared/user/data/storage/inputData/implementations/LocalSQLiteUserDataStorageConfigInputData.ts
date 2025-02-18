import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_TYPES, UserDataStorageTypes } from "../../UserDataStorageType";
import { IBaseUserDataStorageConfigInputData } from "../BaseUserDataStorageConfigInputData";
import { LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA_CONSTANTS } from "../../constants/LocalSQLiteUserDataStorageConfigConstants";

export interface ILocalSQLiteUserDataStorageConfigInputData extends IBaseUserDataStorageConfigInputData {
  type: UserDataStorageTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export const LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_INPUT_DATA_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserDataStorageConfigInputData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_TYPES.LocalSQLite],
      default: USER_DATA_STORAGE_TYPES.LocalSQLite,
      ...LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA_CONSTANTS.type
    },
    dbDirPath: {
      type: "string",
      ...LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA_CONSTANTS.dbDirPath
    },
    dbFileName: {
      type: "string",
      ...LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_JSON_SCHEMA_CONSTANTS.dbFileName
    }
  },
  required: ["type", "dbDirPath", "dbFileName"],
  additionalProperties: false
} as const;
