import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_TYPES, UserDataStorageTypes } from "../../UserDataStorageType";
import { IBaseUserDataStorageConfigInputData } from "../BaseUserDataStorageConfigInputData";

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
      default: USER_DATA_STORAGE_TYPES.LocalSQLite
    },
    dbDirPath: {
      type: "string",
      minLength: 5
    },
    dbFileName: {
      type: "string",
      minLength: 5
    }
  },
  required: ["type", "dbDirPath", "dbFileName"],
  additionalProperties: false
} as const;
