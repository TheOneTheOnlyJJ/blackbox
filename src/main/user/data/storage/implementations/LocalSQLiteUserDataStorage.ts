import { LogFunctions } from "electron-log";
import { BaseUserDataStorageConfig, UserDataStorage } from "../UserDataStorage";
import { UserDataStorageType } from "../UserDataStorageType";
import Ajv, { JSONSchemaType } from "ajv";

export interface LocalSQLiteUserDataStorageConfig extends BaseUserDataStorageConfig {
  type: UserDataStorageType.LocalSQLite;
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
        enum: [UserDataStorageType.LocalSQLite]
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
