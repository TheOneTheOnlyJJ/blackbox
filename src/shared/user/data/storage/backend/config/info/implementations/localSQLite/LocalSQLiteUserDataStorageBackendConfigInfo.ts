import { JSONSchemaType } from "ajv";
import {
  BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS,
  IBaseUserDataStorageBackendConfigInfo
} from "../../BaseUserDataStorageBackendConfigInfo";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "../../../../UserDataStorageBackendType";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../../constants/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConstants";

export interface ILocalSQLiteUserDataStorageBackendConfigInfo extends IBaseUserDataStorageBackendConfigInfo {
  type: UserDataStorageBackendTypes["localSQLite"];
  dbDirPath: string;
  dbFileName: string;
  isLocal: true;
}

export const LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserDataStorageBackendConfigInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite],
      ...BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.type
    },
    dbDirPath: {
      type: "string",
      ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath
    },
    dbFileName: {
      type: "string",
      ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName
    },
    isLocal: {
      type: "boolean",
      enum: [true],
      ...BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.isLocal
    }
  },
  required: ["type", "dbDirPath", "dbFileName", "isLocal"],
  additionalProperties: false
} as const;
