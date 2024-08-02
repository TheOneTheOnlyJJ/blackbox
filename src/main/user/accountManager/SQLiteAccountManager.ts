import { IUser, UserId } from "../IUser";
import { AccountManager, BaseAccountManagerConfig } from "./AccountManager";
import DatabaseConstructor, { Database } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { AccountManagerType } from "./AccountManagerType";
import { join } from "node:path";
import { JSONSchemaType } from "ajv";

type SQLiteJournalMode = string;

interface SQLiteVersion {
  version: string;
}

export interface SQLiteAccountManagerConfig extends BaseAccountManagerConfig {
  type: AccountManagerType.SQLite;
  dbDirPath: string;
  dbFileName: string;
}

export class SQLiteAccountManager extends AccountManager<SQLiteAccountManagerConfig> {
  private readonly db: Database;
  public static readonly CONFIG_SCHEMA: JSONSchemaType<SQLiteAccountManagerConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [AccountManagerType.SQLite]
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

  public constructor(config: SQLiteAccountManagerConfig, logger: LogFunctions) {
    super(config, SQLiteAccountManager.CONFIG_SCHEMA, logger);
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
    this.logger.info('"SQLite" Account Manager ready.');
  }

  public addUser(user: IUser): boolean {
    return true;
  }

  public deleteUser(userId: UserId): boolean {
    return true;
  }

  public deleteUsers(userIds: UserId[]): boolean {
    return true;
  }

  public getUser(userId: UserId): IUser {
    return {
      id: "",
      username: "test",
      password: "test"
    };
  }

  public getUsers(userIds: UserId[]): IUser[] {
    return [
      {
        id: "",
        username: "test",
        password: "test"
      }
    ];
  }

  public getAllUsers(): IUser[] {
    return [
      {
        id: "",
        username: "test",
        password: "test"
      }
    ];
  }

  public getUserCount(): number {
    return 0;
  }

  public isIdValid(id: UserId): boolean {
    return false;
  }

  public isLocal(): boolean {
    return true;
  }

  public close(): boolean {
    this.logger.info(`Closing "${this.config.type}" Account Manager.`);
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
        password TEXT NOT NULL
      )
      `;
      this.db.prepare(CREATE_USERS_TABLE_SQL).run();
      this.logger.debug('Created "users" table.');
    }
  }
}
