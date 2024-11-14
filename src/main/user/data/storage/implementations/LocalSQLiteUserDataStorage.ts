import { LogFunctions } from "electron-log";
import { IBaseUserDataStorageConfig, UserDataStorage } from "../UserDataStorage";
import { USER_DATA_STORAGE_TYPES, UserDataStorageTypes } from "@shared/user/data/storage/UserDataStorageType";
import Ajv, { JSONSchemaType } from "ajv";

export interface ILocalSQLiteUserDataStorageConfig extends IBaseUserDataStorageConfig {
  type: UserDataStorageTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export class LocalSQLiteUserDataStorage extends UserDataStorage<ILocalSQLiteUserDataStorageConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserDataStorageConfig> = {
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

  public constructor(config: ILocalSQLiteUserDataStorageConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, LocalSQLiteUserDataStorage.CONFIG_JSON_SCHEMA, logger, ajv);
  }
}
