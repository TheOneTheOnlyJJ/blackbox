import {
  BaseUserDataStorageBackend,
  IUserDataStorageBackendHandlers,
  IUserDataStorageUserDataBoxConfigFilter,
  IUserDataStorageUserDataTemplateConfigFilter
} from "../../BaseUserDataStorageBackend";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConstants";
import { IBaseUserDataStorageBackendConfig } from "../../config/BaseUserDataStorageBackendConfig";
import DatabaseConstructor, { Database, RunResult } from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getSQLiteVersion } from "@main/utils/SQLite/getSQLiteVersion";
import { getSQLiteJournalModePragmaResult } from "@main/utils/SQLite/getSQLiteJournalModePragmaResult";
import { getSQLiteForeignKeysPragmaResult } from "@main/utils/SQLite/getSQLiteForeignKeysPragmaResult";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { ILocalSQLiteUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/localSQLite/LocalSQLiteUserDataStorageBackendInfo";
import { BASE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/BaseUserDataStorageBackendConstants";
import { IStorageSecuredUserDataBoxConfig, isValidStorageSecuredUserDataBoxConfig } from "@main/user/data/box/config/StorageSecuredUserDataBoxConfig";
import {
  IRawStorageSecuredUserDataBoxConfig,
  rawStorageSecuredUserDataBoxConfigToStorageSecuredUserDataBoxConfig
} from "./utils/RawStorageSecuredUserDataBoxConfig";
import { UUID } from "node:crypto";
import {
  IStorageSecuredUserDataTemplateConfig,
  isValidStorageSecuredUserDataTemplateConfig
} from "@main/user/data/template/config/StorageSecuredUserDataTemplateConfig";
import {
  IRawStorageSecuredUserDataTemplateConfig,
  rawStorageSecuredUserDataTemplateConfigToStorageSecuredUserDataTemplateConfig
} from "./utils/RawStorageSecuredUserDataTemplateConfig";

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
        ...BASE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
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

  public constructor(config: ILocalSQLiteUserDataStorageBackendConfig, logScope: string, handlers: IUserDataStorageBackendHandlers) {
    if (
      !BaseUserDataStorageBackend.isValidConfig<ILocalSQLiteUserDataStorageBackendConfig>(
        config,
        LocalSQLiteUserDataStorageBackend.isValidLocalSQLiteUserDataStorageBackendConfig
      )
    ) {
      throw new Error(`Invalid "${USER_DATA_STORAGE_BACKEND_TYPES.localSQLite}" User Data Storage Backend Config`);
    }
    const INITIAL_INFO: ILocalSQLiteUserDataStorageBackendInfo = {
      type: config.type,
      dbDirPath: config.dbDirPath,
      dbFileName: config.dbFileName,
      isOpen: false,
      isLocal: true
    };
    super(config, INITIAL_INFO, logScope, handlers);
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
      this.createUserDataBoxConfigsTable();
      this.createUserDataTemplateConfigsTable();
      this.logger.info(`Opened "${this.config.type}" User Data Storage Backend.`);
      this.updateInfo({ ...this.getInfo(), isOpen: true });
      this.onOpened?.();
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
      this.onClosed?.();
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

  public isUserDataBoxIdAvailable(boxId: UUID): boolean {
    this.logger.debug(`Checking if User Data Box ID "${boxId}" is available.`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    const SQL_QUERY = `SELECT COUNT(*) AS count FROM user_data_box_configs WHERE box_id = @boxId`;
    const RESULT = this.db.prepare(SQL_QUERY).get({ boxId: boxId }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`User Data Box ID "${boxId}" is available.`);
      return true;
    } else if (RESULT.count === 1) {
      this.logger.debug(`User Data Box ID "${boxId}" is not available.`);
      return false;
    }
    throw new Error(`Found multiple (${RESULT.count.toString()}) User Data Boxes with same ID "${boxId}"`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isUserDataTemplateIdAvailable(templateId: UUID, _: UUID): boolean {
    this.logger.debug(`Checking if User Data Template ID "${templateId}" is available.`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    const SQL_QUERY = `SELECT COUNT(*) AS count FROM user_data_template_configs WHERE template_id = @templateId`;
    const RESULT = this.db.prepare(SQL_QUERY).get({ templateId: templateId }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`User Data Template ID "${templateId}" is available.`);
      return true;
    } else if (RESULT.count === 1) {
      this.logger.debug(`User Data Template ID "${templateId}" is not available.`);
      return false;
    }
    throw new Error(`Found multiple (${RESULT.count.toString()}) User Data Templates with same ID "${templateId}"`);
  }

  public addStorageSecuredUserDataBoxConfig(storageSecuredUserDataBoxConfig: IStorageSecuredUserDataBoxConfig): boolean {
    this.logger.info(`Adding new Storage Secured User Data Box Config "${storageSecuredUserDataBoxConfig.boxId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    this.logger.debug("Validating Storage Secured User Data Box Config.");
    if (!isValidStorageSecuredUserDataBoxConfig(storageSecuredUserDataBoxConfig)) {
      this.logger.debug("Invalid Storage Secured User Data Box Config.");
      return false;
    }
    const SQL_QUERY = `
        INSERT INTO user_data_box_configs (
          box_id, user_data_box_config_iv, user_data_box_config_data
        ) VALUES (
          @boxId, @userDataBoxConfigIV, @userDataBoxConfigData
        )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(SQL_QUERY).run({
        boxId: storageSecuredUserDataBoxConfig.boxId,
        userDataBoxConfigIV: Buffer.from(storageSecuredUserDataBoxConfig.encryptedPrivateStorageSecuredUserDataBoxConfig.iv),
        userDataBoxConfigData: Buffer.from(storageSecuredUserDataBoxConfig.encryptedPrivateStorageSecuredUserDataBoxConfig.data)
      });
      this.logger.silly(`Number of changes: ${RUN_RESULT.changes.toString()}. Last inserted row ID: ${RUN_RESULT.lastInsertRowid.toString()}.`);
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not add Storage Secured User Data Box Config! ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public addStorageSecuredUserDataTemplateConfig(storageSecuredUserDataTemplateConfig: IStorageSecuredUserDataTemplateConfig): boolean {
    this.logger.info(`Adding new Storage Secured User Data Template Config "${storageSecuredUserDataTemplateConfig.templateId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    this.logger.debug("Validating Storage Secured User Data Template Config.");
    if (!isValidStorageSecuredUserDataTemplateConfig(storageSecuredUserDataTemplateConfig)) {
      this.logger.debug("Invalid Storage Secured User Data Template Config.");
      return false;
    }
    const SQL_QUERY = `
        INSERT INTO user_data_template_configs (
          template_id, box_id, user_data_template_config_iv, user_data_template_config_data
        ) VALUES (
          @templateId, @boxId, @userDataTemplateConfigIV, @userDataTemplateConfigData
        )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(SQL_QUERY).run({
        templateId: storageSecuredUserDataTemplateConfig.templateId,
        boxId: storageSecuredUserDataTemplateConfig.boxId,
        userDataTemplateConfigIV: Buffer.from(storageSecuredUserDataTemplateConfig.encryptedPrivateStorageSecuredUserDataTemplateConfig.iv),
        userDataTemplateConfigData: Buffer.from(storageSecuredUserDataTemplateConfig.encryptedPrivateStorageSecuredUserDataTemplateConfig.data)
      });
      this.logger.silly(`Number of changes: ${RUN_RESULT.changes.toString()}. Last inserted row ID: ${RUN_RESULT.lastInsertRowid.toString()}.`);
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not add Storage Secured User Data Template Config! ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public getStorageSecuredUserDataBoxConfigs(storageId: UUID, filter: IUserDataStorageUserDataBoxConfigFilter): IStorageSecuredUserDataBoxConfig[] {
    this.logger.info("Getting Storage Secured User Data Box Configs.");
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    const { includeIds, excludeIds } = filter;
    let SQLQuery = `
      SELECT
        box_id AS boxId,
        user_data_box_config_iv AS boxConfigIV,
        user_data_box_config_data AS boxConfigData
      FROM
        user_data_box_configs
    `;
    const SQL_QUERY_ARGUMENTS: Map<string, string> = new Map<string, string>();
    let concatenationString = " WHERE ";
    if (includeIds !== "all") {
      if (includeIds.length === 0) {
        throw new Error("Include IDs list cannot be empty");
      }
      SQLQuery += " WHERE box_id IN (SELECT value FROM json_each(@includeIdsString))";
      SQL_QUERY_ARGUMENTS.set("includeIdsString", JSON.stringify(includeIds));
      concatenationString = " AND ";
    }
    if (excludeIds !== null) {
      if (excludeIds.length === 0) {
        throw new Error("Exclude IDs list cannot be empty");
      }
      SQLQuery += concatenationString + "box_id NOT IN (SELECT value FROM json_each(@excludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("excludeIdsString", JSON.stringify(excludeIds));
    }
    const RESULTS: IRawStorageSecuredUserDataBoxConfig[] = this.db
      .prepare(SQLQuery)
      .all(Object.fromEntries(SQL_QUERY_ARGUMENTS.entries())) as IRawStorageSecuredUserDataBoxConfig[];
    const STORAGE_SECURED_USER_DATA_BOX_CONFIGS: IStorageSecuredUserDataBoxConfig[] = RESULTS.map(
      (rawStorageSecuredUserDataBoxConfig: IRawStorageSecuredUserDataBoxConfig, idx: number): IStorageSecuredUserDataBoxConfig => {
        const STORAGE_SECURED_USER_DATA_BOX_CONFIG: IStorageSecuredUserDataBoxConfig =
          rawStorageSecuredUserDataBoxConfigToStorageSecuredUserDataBoxConfig(rawStorageSecuredUserDataBoxConfig, storageId, null);
        if (!isValidStorageSecuredUserDataBoxConfig(STORAGE_SECURED_USER_DATA_BOX_CONFIG)) {
          throw new Error(`Invalid Storage Secured User Data Box Config at index: ${idx.toString()}`);
        }
        return STORAGE_SECURED_USER_DATA_BOX_CONFIG;
      }
    );
    this.logger.debug(
      `Returning ${STORAGE_SECURED_USER_DATA_BOX_CONFIGS.length.toString()} Storage Secured User Data Box Config${
        STORAGE_SECURED_USER_DATA_BOX_CONFIGS.length === 1 ? "" : "s"
      }.`
    );
    return STORAGE_SECURED_USER_DATA_BOX_CONFIGS;
  }

  public getStorageSecuredUserDataTemplateConfigs(
    storageId: UUID,
    filter: IUserDataStorageUserDataTemplateConfigFilter
  ): IStorageSecuredUserDataTemplateConfig[] {
    this.logger.info("Getting Storage Secured User Data Template Configs.");
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    const { includeIds, excludeIds, boxes } = filter;
    let SQLQuery = `
      SELECT
        template_id AS templateId,
        box_id AS boxId,
        user_data_template_config_iv AS templateConfigIV,
        user_data_template_config_data AS templateConfigData
      FROM
        user_data_template_configs
    `;
    const SQL_QUERY_ARGUMENTS: Map<string, string> = new Map<string, string>();
    let concatenationString = " WHERE ";
    if (includeIds !== "all") {
      if (includeIds.length === 0) {
        throw new Error("Include IDs list cannot be empty");
      }
      SQLQuery += " WHERE template_id IN (SELECT value FROM json_each(@includeIdsString))";
      SQL_QUERY_ARGUMENTS.set("includeIdsString", JSON.stringify(includeIds));
      concatenationString = " AND ";
    }
    if (excludeIds !== null) {
      if (excludeIds.length === 0) {
        throw new Error("Exclude IDs list cannot be empty");
      }
      SQLQuery += concatenationString + "template_id NOT IN (SELECT value FROM json_each(@excludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("excludeIdsString", JSON.stringify(excludeIds));
      concatenationString = " AND ";
    }
    if (boxes.includeIds !== "all") {
      if (boxes.includeIds.length === 0) {
        throw new Error("Boxes include IDs list cannot be empty");
      }
      SQLQuery += concatenationString + "box_id IN (SELECT value FROM json_each(@boxesIncludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("boxesIncludeIdsString", JSON.stringify(boxes.includeIds));
      concatenationString = " AND ";
    }
    if (boxes.excludeIds !== null) {
      if (boxes.excludeIds.length === 0) {
        throw new Error("Boxes exclude IDs list cannot be empty");
      }
      SQLQuery += concatenationString + "box_id NOT IN (SELECT value FROM json_each(@boxesExcludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("boxesExcludeIdsString", JSON.stringify(boxes.excludeIds));
    }
    const RESULTS: IRawStorageSecuredUserDataTemplateConfig[] = this.db
      .prepare(SQLQuery)
      .all(Object.fromEntries(SQL_QUERY_ARGUMENTS.entries())) as IRawStorageSecuredUserDataTemplateConfig[];
    const STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIGS: IStorageSecuredUserDataTemplateConfig[] = RESULTS.map(
      (rawStorageSecuredUserDataTemplateConfig: IRawStorageSecuredUserDataTemplateConfig, idx: number): IStorageSecuredUserDataTemplateConfig => {
        const STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG: IStorageSecuredUserDataTemplateConfig =
          rawStorageSecuredUserDataTemplateConfigToStorageSecuredUserDataTemplateConfig(rawStorageSecuredUserDataTemplateConfig, storageId, null);
        if (!isValidStorageSecuredUserDataTemplateConfig(STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG)) {
          throw new Error(`Invalid Storage Secured User Data Template Config at index: ${idx.toString()}`);
        }
        return STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG;
      }
    );
    this.logger.debug(
      `Returning ${STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIGS.length.toString()} Storage Secured User Data Template Config${
        STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIGS.length === 1 ? "" : "s"
      }.`
    );
    return STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIGS;
  }

  private createUserDataBoxConfigsTable(): void {
    this.logger.debug('Creating "user_data_box_configs" table.');
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    const DOES_EXIST_SQL_QUERY = "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_box_configs'";
    const DOES_EXIST: boolean = this.db.prepare(DOES_EXIST_SQL_QUERY).get() !== undefined;
    if (DOES_EXIST) {
      this.logger.debug('Found "user_data_box_configs" table.');
    } else {
      this.logger.debug('Did not find "user_data_box_configs" table.');
      const CREATE_SQL_QUERY = `
      CREATE TABLE IF NOT EXISTS user_data_box_configs (
        box_id TEXT NOT NULL PRIMARY KEY,
        user_data_box_config_iv BLOB NOT NULL,
        user_data_box_config_data BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_SQL_QUERY).run();
      this.logger.debug('Created "user_data_box_configs" table.');
    }
  }

  private createUserDataTemplateConfigsTable(): void {
    this.logger.debug('Creating "user_data_template_configs" table.');
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    const DOES_EXIST_SQL_QUERY = "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_template_configs'";
    const DOES_EXIST: boolean = this.db.prepare(DOES_EXIST_SQL_QUERY).get() !== undefined;
    if (DOES_EXIST) {
      this.logger.debug('Found "user_data_template_configs" table.');
    } else {
      this.logger.debug('Did not find "user_data_template_configs" table.');
      const CREATE_SQL_QUERY = `
      CREATE TABLE IF NOT EXISTS user_data_template_configs (
        template_id TEXT NOT NULL PRIMARY KEY,
        box_id TEXT NOT NULL REFERENCES user_data_box_configs(box_id) ON UPDATE CASCADE ON DELETE CASCADE,
        user_data_template_config_iv BLOB NOT NULL,
        user_data_template_config_data BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_SQL_QUERY).run();
      this.logger.debug('Created "user_data_template_configs" table.');
    }
  }
}
