import { LogFunctions } from "electron-log";
import { BaseUserDataStorageConfig, UserDataStorage } from "../UserDataStorage";
import { USER_DATA_STORAGE_TYPES, UserDataStorageTypes } from "@shared/user/data/storage/UserDataStorageType";
import Ajv, { JSONSchemaType } from "ajv";

export interface LocalSQLiteUserDataStorageConfig extends BaseUserDataStorageConfig {
  type: UserDataStorageTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export class LocalSQLiteUserDataStorage extends UserDataStorage<LocalSQLiteUserDataStorageConfig> {
  public static readonly CONFIG_SCHEMA: JSONSchemaType<LocalSQLiteUserDataStorageConfig> = {
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

  public constructor(config: LocalSQLiteUserDataStorageConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, LocalSQLiteUserDataStorage.CONFIG_SCHEMA, logger, ajv);
  }
}
