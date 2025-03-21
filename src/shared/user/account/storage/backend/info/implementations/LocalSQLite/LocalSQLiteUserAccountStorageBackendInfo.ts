import { JSONSchemaType } from "ajv";
import {
  BASE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS,
  IBaseUserAccountStorageBackendInfo
} from "../../BaseUserAccountStorageBackendInfo";
import { LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../constants/implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackendConstants";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES, UserAccountStorageBackendTypes } from "../../../UserAccountStorageBackendType";

// TODO: Add disk size bytes and does file exist properties
export interface ILocalSQLiteUserAccountStorageBackendInfo extends IBaseUserAccountStorageBackendInfo {
  type: UserAccountStorageBackendTypes["localSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export const LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserAccountStorageBackendInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite],
      ...BASE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.type
    },
    dbDirPath: {
      type: "string",
      ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath
    },
    dbFileName: {
      type: "string",
      ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName
    },
    isOpen: {
      type: "boolean",
      ...BASE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isOpen
    },
    isLocal: {
      type: "boolean",
      ...BASE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isLocal
    }
  },
  required: ["type", "dbDirPath", "dbFileName", "isOpen", "isLocal"],
  additionalProperties: false
} as const;
