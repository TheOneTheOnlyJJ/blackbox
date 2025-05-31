import {
  BaseUserDataStorageBackend,
  ICheckUserDataBoxIdAvailabilityArgs,
  ICheckUserDataEntryIdAvailabilityArgs,
  ICheckUserDataTemplateIdAvailabilityArgs,
  IUserDataStorageBackendHandlers,
  IUserDataStorageUserDataBoxConfigFilter,
  IUserDataStorageUserDataEntryFilter,
  IUserDataStorageUserDataTemplateConfigFilter
} from "../../BaseUserDataStorageBackend";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConstants";
import { IBaseUserDataStorageBackendConfig } from "../../config/BaseUserDataStorageBackendConfig";
import DatabaseConstructor, { Database, RunResult, Statement } from "better-sqlite3";
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
import { IStorageSecuredUserDataEntry, isValidStorageSecuredUserDataEntry } from "@main/user/data/entry/StorageSecuredUserDataEntry";
import { IRawStorageSecuredUserDataEntry, rawStorageSecuredUserDataEntryToStorageSecuredUserDataEntry } from "./utils/RawStorageSecuredUserDataEntry";

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
      this.createUserDataEntriesTable();
      // this.createUserDataEntriesToTemplatesJoinTable();
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not open "${this.config.type}" User Data Storage Backend: ${ERROR_MESSAGE}!`);
      return false;
    }
    this.logger.info(`Opened "${this.config.type}" User Data Storage Backend.`);
    this.updateInfo({ ...this.getInfo(), isOpen: true });
    this.onOpened?.();
    return true;
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
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not close "${this.config.type}" User Acount Storage Backend: ${ERROR_MESSAGE}!`);
      return false;
    }
    this.logger.info(`Closed "${this.config.type}" User Data Storage Backend.`);
    this.updateInfo({ ...this.getInfo(), isOpen: false });
    this.onClosed?.();
    return true;
  }

  public isLocal(): boolean {
    return true;
  }

  public isUserDataBoxIdAvailable(args: ICheckUserDataBoxIdAvailabilityArgs): boolean {
    const { boxId } = args;
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

  public isUserDataTemplateIdAvailable(args: ICheckUserDataTemplateIdAvailabilityArgs): boolean {
    const { templateId } = args;
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

  public isUserDataEntryIdAvailable(args: ICheckUserDataEntryIdAvailabilityArgs): boolean {
    const { entryId } = args;
    this.logger.debug(`Checking if User Data Entry ID "${entryId}" is available.`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    const SQL_QUERY = `SELECT COUNT(*) AS count FROM user_data_entries WHERE entry_id = @entryId`;
    const RESULT = this.db.prepare(SQL_QUERY).get({ entryId: entryId }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`User Data Entry ID "${entryId}" is available.`);
      return true;
    } else if (RESULT.count === 1) {
      this.logger.debug(`User Data Entry ID "${entryId}" is not available.`);
      return false;
    }
    throw new Error(`Found multiple (${RESULT.count.toString()}) User Data Entries with same ID "${entryId}"`);
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

  public addStorageSecuredUserDataEntry(storageSecuredUserDataEntry: IStorageSecuredUserDataEntry): boolean {
    this.logger.info(`Adding new Storage Secured User Data Entry "${storageSecuredUserDataEntry.entryId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    this.logger.debug("Validating Storage Secured User Data Entry.");
    if (!isValidStorageSecuredUserDataEntry(storageSecuredUserDataEntry)) {
      this.logger.debug("Invalid Storage Secured User Data Entry.");
      return false;
    }
    const SQL_QUERY_ENTRIES_TABLE = `
      INSERT INTO user_data_entries (
        entry_id, template_id, user_data_entry_iv, user_data_entry_data
      ) VALUES (
        @entryId, @templateId, @userDataEntryIV, @userDataEntryData
      )`;
    // TODO: Reenable these once entries can be mapped to multiple user data templates
    // const SQL_QUERY_JOIN_TABLE = `
    //   INSERT INTO user_data_entries_to_templates (
    //     entry_id, template_id
    //   ) VALUES (
    //     @entryId, @templateId
    //   )`;
    try {
      const INSERT_INTO_ENTRIES_TABLE: Statement = this.db.prepare(SQL_QUERY_ENTRIES_TABLE);
      const RUN_RESULT_ENTRIES_TABLE: RunResult = INSERT_INTO_ENTRIES_TABLE.run({
        entryId: storageSecuredUserDataEntry.entryId,
        templateId: storageSecuredUserDataEntry.templateId,
        userDataEntryIV: Buffer.from(storageSecuredUserDataEntry.encryptedPrivateStorageSecuredUserDataEntry.iv),
        userDataEntryData: Buffer.from(storageSecuredUserDataEntry.encryptedPrivateStorageSecuredUserDataEntry.data)
      });
      // const INSERT_INTO_JOIN_TABLE: Statement = this.db.prepare(SQL_QUERY_JOIN_TABLE);
      // interface IAddEntryTransactionRunResults {
      //   runResultEntriesTable: RunResult;
      //   runResultJoinTable: RunResult;
      // }
      // const INSERT_INTO_BOTH_TABLES_TRANSACTION: Transaction<() => IAddEntryTransactionRunResults> = this.db.transaction<
      //   () => IAddEntryTransactionRunResults
      // >((): IAddEntryTransactionRunResults => {
      //   const RUN_RESULT_ENTRIES_TABLE: RunResult = INSERT_INTO_ENTRIES_TABLE.run({
      //     entryId: storageSecuredUserDataEntry.entryId,
      //     userDataEntryIV: Buffer.from(storageSecuredUserDataEntry.encryptedPrivateStorageSecuredUserDataEntry.iv),
      //     userDataEntryData: Buffer.from(storageSecuredUserDataEntry.encryptedPrivateStorageSecuredUserDataEntry.data)
      //   });
      //   const RUN_RESULT_JOIN_TABLE: RunResult = INSERT_INTO_JOIN_TABLE.run({
      //     entryId: storageSecuredUserDataEntry.entryId,
      //     templateId: storageSecuredUserDataEntry.templateId
      //   });
      //   return { runResultEntriesTable: RUN_RESULT_ENTRIES_TABLE, runResultJoinTable: RUN_RESULT_JOIN_TABLE };
      // });
      // const TRANSACTION_RESULT: IAddEntryTransactionRunResults = INSERT_INTO_BOTH_TABLES_TRANSACTION.immediate();
      this.logger.silly(
        `Entries table number of changes: ${RUN_RESULT_ENTRIES_TABLE.changes.toString()}. Last inserted row ID: ${RUN_RESULT_ENTRIES_TABLE.lastInsertRowid.toString()}.`
      );
      // this.logger.silly(
      //   `Entries to Templates join table number of changes: ${TRANSACTION_RESULT.runResultJoinTable.changes.toString()}. Last inserted row ID: ${TRANSACTION_RESULT.runResultJoinTable.lastInsertRowid.toString()}.`
      // );
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not add Storage Secured User Data Entry! ${ERROR_MESSAGE}!`);
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
        throw new Error("Box include IDs list cannot be empty");
      }
      SQLQuery += concatenationString + "box_id IN (SELECT value FROM json_each(@boxIncludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("boxIncludeIdsString", JSON.stringify(boxes.includeIds));
      concatenationString = " AND ";
    }
    if (boxes.excludeIds !== null) {
      if (boxes.excludeIds.length === 0) {
        throw new Error("Box exclude IDs list cannot be empty");
      }
      SQLQuery += concatenationString + "box_id NOT IN (SELECT value FROM json_each(@boxExcludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("boxExcludeIdsString", JSON.stringify(boxes.excludeIds));
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

  public getStorageSecuredUserDataEntries(storageId: UUID, filter: IUserDataStorageUserDataEntryFilter): IStorageSecuredUserDataEntry[] {
    this.logger.info("Getting Storage Secured User Data Entries.");
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    const { includeIds, excludeIds, templates } = filter;
    let SQLQuery = `
      SELECT
        e.entry_id AS entryId,
        tc.box_id AS boxId,
        e.template_id AS templateId,
        e.user_data_entry_iv AS entryIV,
        e.user_data_entry_data AS entryData
      FROM
        user_data_entries e
      INNER JOIN
        user_data_template_configs tc
      ON
        e.template_id = tc.template_id
    `;
    const SQL_QUERY_ARGUMENTS: Map<string, string> = new Map<string, string>();
    let concatenationString = " WHERE ";
    if (includeIds !== "all") {
      if (includeIds.length === 0) {
        throw new Error("Include IDs list cannot be empty");
      }
      SQLQuery += " WHERE e.entry_id IN (SELECT value FROM json_each(@includeIdsString))";
      SQL_QUERY_ARGUMENTS.set("includeIdsString", JSON.stringify(includeIds));
      concatenationString = " AND ";
    }
    if (excludeIds !== null) {
      if (excludeIds.length === 0) {
        throw new Error("Exclude IDs list cannot be empty");
      }
      SQLQuery += concatenationString + "e.entry_id NOT IN (SELECT value FROM json_each(@excludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("excludeIdsString", JSON.stringify(excludeIds));
      concatenationString = " AND ";
    }
    if (templates.includeIds !== "all") {
      if (templates.includeIds.length === 0) {
        throw new Error("Template include IDs list cannot be empty");
      }
      SQLQuery += concatenationString + "e.template_id IN (SELECT value FROM json_each(@templateIncludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("templateIncludeIdsString", JSON.stringify(templates.includeIds));
      concatenationString = " AND ";
    }
    if (templates.excludeIds !== null) {
      if (templates.excludeIds.length === 0) {
        throw new Error("Template exclude IDs list cannot be empty");
      }
      SQLQuery += concatenationString + "e.template_id NOT IN (SELECT value FROM json_each(@templateExcludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("templateExcludeIdsString", JSON.stringify(templates.excludeIds));
    }
    const RESULTS: IRawStorageSecuredUserDataEntry[] = this.db
      .prepare(SQLQuery)
      .all(Object.fromEntries(SQL_QUERY_ARGUMENTS.entries())) as IRawStorageSecuredUserDataEntry[];
    const STORAGE_SECURED_USER_DATA_ENTRIES: IStorageSecuredUserDataEntry[] = RESULTS.map(
      (rawStorageSecuredUserDataEntry: IRawStorageSecuredUserDataEntry, idx: number): IStorageSecuredUserDataEntry => {
        const STORAGE_SECURED_USER_DATA_ENTRY: IStorageSecuredUserDataEntry = rawStorageSecuredUserDataEntryToStorageSecuredUserDataEntry(
          rawStorageSecuredUserDataEntry,
          storageId,
          null
        );
        if (!isValidStorageSecuredUserDataEntry(STORAGE_SECURED_USER_DATA_ENTRY)) {
          throw new Error(`Invalid Storage Secured User Data Entry at index: ${idx.toString()}`);
        }
        return STORAGE_SECURED_USER_DATA_ENTRY;
      }
    );
    this.logger.debug(
      `Returning ${STORAGE_SECURED_USER_DATA_ENTRIES.length.toString()} Storage Secured User Data ${
        STORAGE_SECURED_USER_DATA_ENTRIES.length === 1 ? "Entry" : "Entries"
      }.`
    );
    return STORAGE_SECURED_USER_DATA_ENTRIES;
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

  private createUserDataEntriesTable(): void {
    this.logger.debug('Creating "user_data_entries" table.');
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
    }
    const DOES_EXIST_SQL_QUERY = "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_entries'";
    const DOES_EXIST: boolean = this.db.prepare(DOES_EXIST_SQL_QUERY).get() !== undefined;
    if (DOES_EXIST) {
      this.logger.debug('Found "user_data_entries" table.');
    } else {
      this.logger.debug('Did not find "user_data_entries" table.');
      const CREATE_SQL_QUERY = `
      CREATE TABLE IF NOT EXISTS user_data_entries (
        entry_id TEXT NOT NULL PRIMARY KEY,
        template_id TEXT NOT NULL REFERENCES user_data_template_configs(template_id) ON UPDATE CASCADE ON DELETE CASCADE,
        user_data_entry_iv BLOB NOT NULL,
        user_data_entry_data BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_SQL_QUERY).run();
      this.logger.debug('Created "user_data_entries" table.');
    }
  }

  // TODO: Enable when implementing multi-template user data entries
  // private createUserDataEntriesToTemplatesJoinTable(): void {
  //   this.logger.debug('Creating "user_data_entries_to_templates" join table.');
  //   if (this.db === null) {
  //     throw new Error(`Closed "${this.config.type}" User Data Storage Backend`);
  //   }
  //   const DOES_EXIST_SQL_QUERY = "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_entries_to_templates'";
  //   const DOES_EXIST: boolean = this.db.prepare(DOES_EXIST_SQL_QUERY).get() !== undefined;
  //   if (DOES_EXIST) {
  //     this.logger.debug('Found "user_data_entries_to_templates" join table.');
  //   } else {
  //     this.logger.debug('Did not find "user_data_entries_to_templates" join table.');
  //     const CREATE_SQL_QUERY = `
  //     CREATE TABLE IF NOT EXISTS user_data_entries_to_templates (
  //       entry_id TEXT NOT NULL REFERENCES user_data_entries(entry_id) ON UPDATE CASCADE ON DELETE CASCADE,
  //       template_id TEXT NOT NULL REFERENCES user_data_template_configs(template_id) ON UPDATE CASCADE ON DELETE CASCADE,
  //       PRIMARY KEY (entry_id, template_id)
  //     )
  //     `;
  //     this.db.prepare(CREATE_SQL_QUERY).run();
  //     this.logger.debug('Created "user_data_entries_to_templates" join table.');
  //   }
  // }
}
