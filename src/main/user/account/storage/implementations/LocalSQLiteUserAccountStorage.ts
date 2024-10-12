import { BaseUserAccountStorageConfig, UserAccountStorage } from "../UserAccountStorage";
import DatabaseConstructor, { Database, RunResult } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Ajv, { JSONSchemaType } from "ajv";
import { UserAccountStorageType } from "../UserAccountStorageType";
import { ISecuredNewUserData } from "../../ISecuredNewUserData";
import { UUID } from "crypto";

export interface LocalSQLiteUserAccountStorageConfig extends BaseUserAccountStorageConfig {
  type: UserAccountStorageType.LocalSQLite;
  dbDirPath: string;
  dbFileName: string;
}

type SQLiteJournalModePragmaResult = undefined | null | string;
type SQLiteForeignKeysPragmaResult = undefined | null | 0 | 1;

interface SQLiteVersion {
  version: string;
}

export class LocalSQLiteUserAccountStorage extends UserAccountStorage<LocalSQLiteUserAccountStorageConfig> {
  public static readonly CONFIG_SCHEMA: JSONSchemaType<LocalSQLiteUserAccountStorageConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [UserAccountStorageType.LocalSQLite]
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

  private readonly db: Database;

  public constructor(config: LocalSQLiteUserAccountStorageConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, LocalSQLiteUserAccountStorage.CONFIG_SCHEMA, logger, ajv);
    // Create db and directories
    if (existsSync(this.config.dbDirPath)) {
      this.logger.debug(`Found database directory at path: "${this.config.dbDirPath}". Looking for SQLite file.`);
    } else {
      this.logger.debug(`Could not find database directory path: "${this.config.dbDirPath}". Creating required directories.`);
      mkdirSync(this.config.dbDirPath, { recursive: true });
      this.logger.debug(`Database directory path created: "${this.config.dbDirPath}".`);
    }
    const DB_FILE_PATH: string = join(this.config.dbDirPath, this.config.dbFileName);
    if (existsSync(DB_FILE_PATH)) {
      this.logger.debug(`Found SQLite file "${this.config.dbFileName}" at path: "${DB_FILE_PATH}". Opening.`);
    } else {
      this.logger.debug(`Could not find SQLite file "${this.config.dbFileName}" at path: "${DB_FILE_PATH}". Creating new.`);
    }
    this.logger.silly("Running SQLite database constructor.");
    this.db = new DatabaseConstructor(DB_FILE_PATH);
    this.logger.silly("SQLite database constructor completed.");
    // Log SQLite version
    this.logger.debug(`Using SQLite version: "${(this.db.prepare("SELECT sqlite_version() AS version").get() as SQLiteVersion).version}".`);
    // Configuration
    // Journal mode
    this.logger.debug("Setting journal mode to WAL.");
    this.db.pragma("journal_mode = WAL");
    const JOURNAL_MODE: SQLiteJournalModePragmaResult = this.db.pragma("journal_mode", { simple: true }) as SQLiteJournalModePragmaResult;
    this.logger.silly(`Journal mode: "${String(JOURNAL_MODE)}".`);
    // Foreign keys
    this.logger.debug("Setting on foreign key support.");
    this.db.pragma("foreign_keys = ON");
    const FOREIGN_KEYS: SQLiteForeignKeysPragmaResult = this.db.pragma("foreign_keys", { simple: true }) as SQLiteForeignKeysPragmaResult;
    this.logger.silly(`Foreign keys: "${String(FOREIGN_KEYS)}".`);
    // Initialise required tables
    this.initialiseUsersTable();
    this.initialiseUserDataStorageConfigurationsTable();
    this.logger.info(`"${this.config.type}" User Acount Storage ready.`);
  }

  public isUsernameAvailable(username: string): boolean {
    // TODO: Implement this properly
    this.logger.debug(`Checking username availability for username: "${username}".`);
    const IS_USERNAME_AVAILABLE_SQL = "SELECT COUNT(*) AS count FROM users WHERE username = @username";
    const RESULT = this.db.prepare(IS_USERNAME_AVAILABLE_SQL).get({ username: username }) as { count: number };
    if (RESULT.count > 0) {
      this.logger.debug("Username unavailable.");
      return false;
    }
    this.logger.debug("Username available.");
    return true;
  }

  public addUser(userData: ISecuredNewUserData): boolean {
    this.logger.debug(`Adding new user: "${userData.username}".`);
    const INSERT_NEW_USER_SQL =
      "INSERT INTO users (id, username, password_hash, password_salt) VALUES (@id, @username, @passwordHash, @passwordSalt)";
    try {
      const INFO: RunResult = this.db.prepare(INSERT_NEW_USER_SQL).run({
        id: userData.id,
        username: userData.username,
        passwordHash: userData.passwordHash,
        passwordSalt: userData.passwordSalt
      });
      this.logger.info("User added successfully!");
      this.logger.silly(`Number of changes: "${INFO.changes.toString()}". Last inserted row ID: "${INFO.lastInsertRowid.toString()}".`);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not add user! ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public getUserIdByUsername(username: string): UUID | null {
    this.logger.debug(`Getting user ID by username for user: "${username}".`);
    const GET_USER_ID_BY_USERNAME_SQL = "SELECT id FROM users WHERE username = @username LIMIT 1";
    const RESULT = this.db.prepare(GET_USER_ID_BY_USERNAME_SQL).get({ username: username }) as { id: UUID } | undefined;
    return RESULT === undefined ? null : RESULT.id;
  }

  public getPasswordDataByUserId(userId: UUID): [Buffer, Buffer] | null {
    this.logger.debug(`Getting password salt for user with ID: "${userId}".`);
    const GET_USER_PASSWORD_SALT_BY_USER_ID = "SELECT password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE id = @id LIMIT 1";
    const RESULT = this.db.prepare(GET_USER_PASSWORD_SALT_BY_USER_ID).get({ id: userId }) as
      | { passwordHash: Buffer; passwordSalt: Buffer }
      | undefined;
    return RESULT === undefined ? null : [RESULT.passwordHash, RESULT.passwordSalt];
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    const USER_COUNT_SQL = "SELECT COUNT(*) AS count FROM users";
    const RESULT = this.db.prepare(USER_COUNT_SQL).get() as { count: number };
    this.logger.debug(`User count: ${RESULT.count.toString()}.`);
    return RESULT.count;
  }

  public close(): boolean {
    this.db.close();
    return true;
  }

  private initialiseUsersTable(): void {
    this.logger.debug('Initialising "users" table.');
    const SELECT_USERS_TABLE_SQL = "SELECT name FROM sqlite_master WHERE type='table' AND name='users'";
    const DOES_USERS_TABLE_EXIST: boolean = this.db.prepare(SELECT_USERS_TABLE_SQL).get() !== undefined;
    if (DOES_USERS_TABLE_EXIST) {
      this.logger.debug('Found "users" table.');
    } else {
      this.logger.debug('Did not find "users" table. Creating.');
      const CREATE_USERS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT NOT NULL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash BLOB NOT NULL,
        password_salt BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_USERS_TABLE_SQL).run();
      this.logger.debug('Created "users" table.');
    }
  }

  private initialiseUserDataStorageConfigurationsTable(): void {
    this.logger.debug('Initialising "user_data_storage_configurations" table.');
    const SELECT_USER_DATA_STORAGE_CONFIGURATIONS_TABLE_SQL =
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_storage_configurations'";
    const DOES_USER_DATA_STORAGE_CONFIGURATIONS_TABLE_EXIST: boolean =
      this.db.prepare(SELECT_USER_DATA_STORAGE_CONFIGURATIONS_TABLE_SQL).get() !== undefined;
    if (DOES_USER_DATA_STORAGE_CONFIGURATIONS_TABLE_EXIST) {
      this.logger.debug('Found "user_data_storage_configurations" table.');
    } else {
      this.logger.debug('Did not find "user_data_storage_configurations" table. Creating.');
      const CREATE_USERS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS user_data_storage_configurations (
        user_id TEXT NOT NULL,
        configuration BLOB NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
      )
      `;
      this.db.prepare(CREATE_USERS_TABLE_SQL).run();
      this.logger.debug('Created "user_data_storage_configurations" table.');
    }
  }
}
