import { BaseUserDataStorageBackend } from "../../BaseUserDataStorageBackend";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConstants";
import {
  BASE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS,
  IBaseUserDataStorageBackendConfig
} from "../../config/BaseUserDataStorageBackendConfig";
import DatabaseConstructor, { Database } from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getSQLiteVersion } from "@main/utils/SQLite/getSQLiteVersion";
import { getSQLiteJournalModePragmaResult } from "@main/utils/SQLite/getSQLiteJournalModePragmaResult";
import { getSQLiteForeignKeysPragmaResult } from "@main/utils/SQLite/getSQLiteForeignKeysPragmaResult";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { ILocalSQLiteUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/localSQLite/LocalSQLiteUserDataStorageBackendInfo";

export interface ILocalSQLiteUserDataStorageBackendConfig extends IBaseUserDataStorageBackendConfig {
  type: UserDataStorageBackendTypes["localSQLite"];
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
        enum: [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite],
        ...BASE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.type
      },
      dbDirPath: {
        type: "string",
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath
      },
      dbFileName: {
        type: "string",
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName
      }
    },
    required: ["type", "dbDirPath", "dbFileName"],
    additionalProperties: false
  } as const;
  public static readonly isValidLocalSQLiteUserDataStorageBackendConfig: ValidateFunction<ILocalSQLiteUserDataStorageBackendConfig> =
    AJV.compile<ILocalSQLiteUserDataStorageBackendConfig>(LocalSQLiteUserDataStorageBackend.CONFIG_JSON_SCHEMA);

  private db: Database | null;

  public constructor(
    config: ILocalSQLiteUserDataStorageBackendConfig,
    logScope: string,
    onInfoChanged: (newInfo: Readonly<ILocalSQLiteUserDataStorageBackendInfo>) => void
  ) {
    if (
      !BaseUserDataStorageBackend.isValidConfig<ILocalSQLiteUserDataStorageBackendConfig>(
        config,
        LocalSQLiteUserDataStorageBackend.isValidLocalSQLiteUserDataStorageBackendConfig
      )
    ) {
      throw new Error(`Invalid ${USER_DATA_STORAGE_BACKEND_TYPES.localSQLite} User Data Storage Backend Config`);
    }
    const INITIAL_INFO: ILocalSQLiteUserDataStorageBackendInfo = {
      type: config.type,
      dbDirPath: config.dbDirPath,
      dbFileName: config.dbFileName,
      isOpen: false,
      isLocal: true
    };
    super(config, INITIAL_INFO, logScope, onInfoChanged);
    this.db = null;
  }

  public isOpen(): boolean {
    return this.db !== null;
  }

  public isClosed(): boolean {
    return this.db === null;
  }

  public open(): boolean {
    this.logger.info(`Opening "${this.config.type}" User Data Storage Backend.`);
    if (this.isOpen()) {
      this.logger.warn(`Already opened "${this.config.type}" User Data Storage Backend. No-op.`);
      return true;
    }
    try {
      if (existsSync(this.config.dbDirPath)) {
        this.logger.debug(`Found database directory path: "${this.config.dbDirPath}".`);
      } else {
        this.logger.debug(`No database directory path: "${this.config.dbDirPath}".`);
        mkdirSync(this.config.dbDirPath, { recursive: true });
        this.logger.debug(`Created database directory path: "${this.config.dbDirPath}".`);
      }
      const DB_FILE_PATH: string = join(this.config.dbDirPath, this.config.dbFileName);
      if (existsSync(DB_FILE_PATH)) {
        this.logger.debug(`Found existing database "${this.config.dbFileName}" at path: "${DB_FILE_PATH}".`);
      } else {
        this.logger.debug(`No existing database "${this.config.dbFileName}" at path: "${DB_FILE_PATH}".`);
      }
      this.db = new DatabaseConstructor(DB_FILE_PATH);
      this.logger.debug("Created database.");
      // SQLite version
      this.logger.debug(`SQLite version: ${getSQLiteVersion(this.db)}.`);
      // Journal mode
      this.db.pragma("journal_mode = WAL");
      this.logger.debug(`Journal mode: "${getSQLiteJournalModePragmaResult(this.db)}".`);
      // Foreign keys
      this.db.pragma("foreign_keys = ON");
      const ARE_FOREIGN_KEYS_ENABLED: boolean = getSQLiteForeignKeysPragmaResult(this.db);
      this.logger.debug(`Foreign keys: ${ARE_FOREIGN_KEYS_ENABLED.toString()}.`);
      if (!ARE_FOREIGN_KEYS_ENABLED) {
        throw new Error("Could not enable foreign keys");
      }
      // Create tables
      // TODO: Add tables
      this.logger.info(`Opened "${this.config.type}" User Data Storage Backend.`);
      this.updateInfo({ ...this.getInfo(), isOpen: true });
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not open "${this.config.type}" User Data Storage Backend: ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public close(): boolean {
    this.logger.info(`Closing "${this.config.type}" User Data Storage Backend.`);
    if (this.db === null) {
      this.logger.warn(`Already closed "${this.config.type}" User Data Storage Backend. No-op.`);
      return true;
    }
    try {
      this.db.close();
      this.db = null;
      this.logger.info(`Closed "${this.config.type}" User Data Storage Backend.`);
      this.updateInfo({ ...this.getInfo(), isOpen: false });
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not close "${this.config.type}" User Acount Storage Backend: ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public isLocal(): boolean {
    return true;
  }
}
