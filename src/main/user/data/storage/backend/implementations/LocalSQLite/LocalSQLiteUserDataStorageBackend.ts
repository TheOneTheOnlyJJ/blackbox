import { LogFunctions } from "electron-log";
import { BaseUserDataStorageBackend } from "../../BaseUserDataStorageBackend";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import Ajv, { JSONSchemaType } from "ajv";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/implementations/LocalSQLite/LocalSQLiteUserDataStorageBackendConfigConstants";
import { IBaseUserDataStorageBackendConfig } from "../../config/BaseUserDataStorageBackendConfig";

export interface ILocalSQLiteUserDataStorageBackendConfig extends IBaseUserDataStorageBackendConfig {
  type: UserDataStorageBackendTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export class LocalSQLiteUserDataStorageBackend extends BaseUserDataStorageBackend<ILocalSQLiteUserDataStorageBackendConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserDataStorageBackendConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite],
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.type
      },
      dbDirPath: {
        type: "string",
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.dbDirPath
      },
      dbFileName: {
        type: "string",
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.dbFileName
      }
    },
    required: ["type", "dbDirPath", "dbFileName"],
    additionalProperties: false
  } as const;

  public constructor(config: ILocalSQLiteUserDataStorageBackendConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, LocalSQLiteUserDataStorageBackend.CONFIG_JSON_SCHEMA, logger, ajv);
  }
}
