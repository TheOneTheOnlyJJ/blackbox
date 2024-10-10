import { BaseUserAccountStorageConfig, UserAccountStorage } from "../UserAccountStorage";
import DatabaseConstructor, { Database } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Ajv, { JSONSchemaType } from "ajv";
import { UserAccountStorageType } from "../UserAccountStorageType";
import { ISecuredNewUserData } from "../../ISecuredNewUserData";
import { UUID } from "crypto";

export interface SQLiteUserAccountStorageConfig extends BaseUserAccountStorageConfig {
  type: UserAccountStorageType.SQLite;
  dbDirPath: string;
  dbFileName: string;
}

type SQLiteJournalMode = string;

interface SQLiteVersion {
  version: string;
}

export class SQLiteUserAccountStorage extends UserAccountStorage<SQLiteUserAccountStorageConfig> {
  public static readonly CONFIG_SCHEMA: JSONSchemaType<SQLiteUserAccountStorageConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [UserAccountStorageType.SQLite]
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

  public constructor(config: SQLiteUserAccountStorageConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, SQLiteUserAccountStorage.CONFIG_SCHEMA, logger, ajv);
    // Create db and directories as required
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
    this.logger.info(`Using SQLite version: ${(this.db.prepare("SELECT sqlite_version() AS version").get() as SQLiteVersion).version}.`);
    // Configuration
    this.logger.debug("Setting journal mode to WAL.");
    this.db.pragma("journal_mode = WAL");
    this.logger.silly(`Journal mode: ${this.db.pragma("journal_mode", { simple: true }) as SQLiteJournalMode}.`);
    this.initialiseUsersTable();
    this.logger.info('"SQLite" User Acount Storage ready.');
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
      const INFO: DatabaseConstructor.RunResult = this.db.prepare(INSERT_NEW_USER_SQL).run({
        id: userData.id,
        username: userData.username,
        passwordHash: userData.passwordHash,
        passwordSalt: userData.passwordSalt
      });
      this.logger.info(
        `User added successfully! Number of changes: ${INFO.changes.toString()}. Last inserted row ID: ${INFO.lastInsertRowid.toString()}.`
      );
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
    const doesUsersTableExist: boolean = this.db.prepare(SELECT_USERS_TABLE_SQL).get() !== undefined;
    if (doesUsersTableExist) {
      this.logger.debug('Found "users" table.');
    } else {
      this.logger.debug('Did not find "users" table. Creating.');
      const CREATE_USERS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash BLOB NOT NULL,
        password_salt BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_USERS_TABLE_SQL).run();
      this.logger.debug('Created "users" table.');
    }
  }
}
