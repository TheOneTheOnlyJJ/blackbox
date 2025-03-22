import { JSONSchemaType } from "ajv";
import { BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS, IBaseUserDataStorageBackendInfo } from "../../BaseUserDataStorageBackendInfo";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../constants/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConstants";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "../../../UserDataStorageBackendType";

export interface ILocalSQLiteUserDataStorageBackendInfo extends IBaseUserDataStorageBackendInfo {
  type: UserDataStorageBackendTypes["localSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export const LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserDataStorageBackendInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite],
      ...BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.type
    },
    dbDirPath: {
      type: "string",
      ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath
    },
    dbFileName: {
      type: "string",
      ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName
    },
    isOpen: {
      type: "boolean",
      ...BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isOpen
    },
    isLocal: {
      type: "boolean",
      ...BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isLocal
    }
  },
  required: ["type", "dbDirPath", "dbFileName", "isOpen", "isLocal"],
  additionalProperties: false
} as const;
