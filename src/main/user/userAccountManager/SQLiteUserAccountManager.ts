import { IUser, UserId } from "../IUser";
import { UserAccountManager, BaseUserAccountManagerConfig } from "./UserAccountManager";
import DatabaseConstructor, { Database } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { UserAccountManagerType } from "./UserAccountManagerType";
import { join } from "node:path";

type SQLiteJournalMode = string;

interface SQLiteVersion {
  version: string;
}

export interface SQLiteUserAccountManagerConfig extends BaseUserAccountManagerConfig {
  type: UserAccountManagerType.SQLite;
  dbDirPath: string;
  dbFileName: string;
}

export class SQLiteUserAccountManager extends UserAccountManager<SQLiteUserAccountManagerConfig> {
  private db: Database;

  public constructor(config: SQLiteUserAccountManagerConfig, logger: LogFunctions) {
    super(config, logger);
    // Validate config
    if (!this.isConfigValid()) {
      throw new Error("Invalid config passed to User Account Manager constructor");
    }
    // Create db and directories as required
    const DB_DIR_PATH: string = config.dbDirPath;
    if (existsSync(DB_DIR_PATH)) {
      this.logger.debug(`Found database directory at path: "${DB_DIR_PATH}". Looking for SQLite file.`);
    } else {
      this.logger.debug(`Could not find database directory path: "${DB_DIR_PATH}". Creating required directories.`);
      mkdirSync(DB_DIR_PATH, { recursive: true });
      this.logger.debug(`Database directory path created: "${DB_DIR_PATH}".`);
    }
    const DB_FILE_NAME: string = config.dbFileName;
    const DB_FILE_PATH: string = join(DB_DIR_PATH, DB_FILE_NAME);
    if (existsSync(DB_FILE_PATH)) {
      this.logger.debug(`Found SQLite file "${DB_FILE_NAME}" at path: "${DB_FILE_PATH}". Opening.`);
    } else {
      this.logger.debug(`Could not find SQLite file "${DB_FILE_NAME}" at path: "${DB_FILE_PATH}". Creating new.`);
    }
    this.logger.silly("Running SQLite database constructor.");
    this.db = new DatabaseConstructor(DB_FILE_PATH);
    this.logger.silly("SQLite database constructor completed.");
    // Get SQLite version
    this.logger.info(`Using SQLite version: ${(this.db.prepare("SELECT sqlite_version() AS version").get() as SQLiteVersion).version}.`);
    // Configuration
    this.logger.debug("Setting journal mode to WAL.");
    this.db.pragma("journal_mode = WAL");
    this.logger.silly(`Journal mode: ${this.db.pragma("journal_mode", { simple: true }) as SQLiteJournalMode}.`);
    this.initialiseUsersTable();
    this.logger.info("SQLite User Account Manager ready.");
  }

  public isConfigValid(): boolean {
    const isValid: boolean =
      super.isConfigValid() &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      this.config.type === UserAccountManagerType.SQLite &&
      typeof this.config.dbDirPath === "string" &&
      this.config.dbDirPath.length > 0 &&
      typeof this.config.dbFileName === "string" &&
      this.config.dbFileName.length > 0;
    if (isValid) {
      this.logger.debug("Valid config.");
      return true;
    } else {
      this.logger.debug("Invalid config.");
      return false;
    }
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
    this.logger.info(`Closing "${this.config.type}" User Account Manager.`);
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
