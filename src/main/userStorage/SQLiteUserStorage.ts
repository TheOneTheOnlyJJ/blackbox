import IUser, { UserId } from "./../user/IUser";
import IUserStorage from "./IUserStorage";
import DatabaseConstructor, { Database } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

type SQLiteJournalMode = string;

interface SQLiteVersion {
  version: string;
}

export default class SQLiteUserStorage implements IUserStorage {
  private db: Database;
  private logger: LogFunctions;
  readonly storageType = "SQLite";

  constructor(dbDirPath: string, dbFileName: string, logger: LogFunctions) {
    this.logger = logger;
    this.logger.info(`Running SQLite user storage constructor with database directory path: ${dbDirPath} and database file name: ${dbFileName}.`);
    const DB_FILE_PATH: string = join(dbDirPath, dbFileName);
    // Create directories if required and log their existence
    if (existsSync(dbDirPath)) {
      this.logger.debug(`Found directory at path: ${dbDirPath}. Searching for database.`);
    } else {
      this.logger.debug(`Could not find directory at path: ${dbDirPath}. Creating all required directories & subdirectories.`);
      mkdirSync(dbDirPath, { recursive: true });
      this.logger.debug(`Created directory at path: ${dbDirPath}.`);
    }
    // Log database file existence
    if (existsSync(DB_FILE_PATH)) {
      this.logger.debug(`Found database file at path: ${DB_FILE_PATH}. Opening existing database.`);
    } else {
      this.logger.debug(`Could not find database file at path: ${DB_FILE_PATH}. Creating new empty database.`);
    }
    // Constructor
    this.logger.debug("Running SQLite constructor...");
    this.db = new DatabaseConstructor(DB_FILE_PATH);
    this.logger.debug("SQLite constructor completed.");
    // Configuration
    this.logger.debug("Setting WAL journal mode.");
    this.db.pragma("journal_mode = WAL");
    this.logger.silly(`Journal mode: ${this.db.pragma("journal_mode", { simple: true }) as SQLiteJournalMode}.`);
    const SQLITE_VERSION: SQLiteVersion = this.db.prepare("SELECT sqlite_version() AS version").get() as SQLiteVersion;
    this.logger.info(`SQLite version: ${SQLITE_VERSION.version}.`);
    this.initialiseUsersTable();
    this.logger.info("SQLite user storage ready.");
  }

  addUser(user: IUser): boolean {
    return true;
  }

  deleteUser(userId: UserId): boolean {
    return true;
  }

  deleteUsers(userIds: UserId[]): boolean {
    return true;
  }

  getUser(userId: UserId): IUser {
    return {
      id: "",
      username: "test",
      password: "test"
    };
  }

  getUsers(userIds: UserId[]): IUser[] {
    return [
      {
        id: "",
        username: "test",
        password: "test"
      }
    ];
  }

  getAllUsers(): IUser[] {
    return [
      {
        id: "",
        username: "test",
        password: "test"
      }
    ];
  }

  getUserCount(): number {
    return 0;
  }

  isIdValid(id: UserId): boolean {
    return false;
  }

  isLocal(): boolean {
    return true;
  }

  close(): boolean {
    this.logger.info("Closing SQLite user storage database.");
    this.db.close();
    return true;
  }

  private initialiseUsersTable(): void {
    this.logger.info("Initialising users table.");
    const SELECT_USERS_TABLE_SQL = `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`;
    const doesUsersTableExist: boolean = this.db.prepare(SELECT_USERS_TABLE_SQL).get() !== undefined;
    if (doesUsersTableExist) {
      this.logger.debug("Found users table.");
    } else {
      this.logger.debug("Did not find users table. Creating...");
      const CREATE_USERS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
      `;
      this.db.prepare(CREATE_USERS_TABLE_SQL).run();
      this.logger.debug("Created users table.");
    }
  }
}
