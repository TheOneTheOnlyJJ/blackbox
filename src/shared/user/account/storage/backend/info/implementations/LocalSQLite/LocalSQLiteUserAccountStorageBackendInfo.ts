import { JSONSchemaType } from "ajv";
import { IBaseUserAccountStorageBackendInfo } from "../../BaseUserAccountStorageBackendInfo";
import { LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../constants/implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackendConstants";

export interface ILocalSQLiteUserAccountStorageBackendInfo extends IBaseUserAccountStorageBackendInfo {
  dbDirPath: string;
  dbFileName: string;
}

export const LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserAccountStorageBackendInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    type: {
      type: "string",
      ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
    },
    dbDirPath: {
      type: "string",
      ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath
    },
    dbFileName: {
      type: "string",
      ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName
    }
  },
  required: ["type", "dbDirPath", "dbFileName"],
  additionalProperties: false
} as const;
