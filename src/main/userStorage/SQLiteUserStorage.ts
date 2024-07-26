import IUser, { UserId } from "./../user/IUser";
import IUserStorage from "./IUserStorage";
import DatabaseConstructor, { Database } from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

type SQLiteJournalMode = string;

interface SQLiteVersion {
  version: string;
}

export default class SQLiteUserStorage implements IUserStorage {
  private db: Database;
  readonly storageType = "SQLite";

  constructor(dbDirPath: string, dbFileName: string) {
    console.log(`Running SQLite user storage constructor with database directory path: ${dbDirPath} and database file name: ${dbFileName}.`);
    const DB_FILE_PATH: string = join(dbDirPath, dbFileName);
    // Create directories if required and log their existence
    if (existsSync(dbDirPath)) {
      console.log(`Found directory at path: ${dbDirPath}. Searching for database.`);
    } else {
      console.log(`Could not find directory at path: ${dbDirPath}. Creating all required directories & subdirectories.`);
      mkdirSync(dbDirPath, { recursive: true });
      console.log(`Created directory at path: ${dbDirPath}.`);
    }
    // Log database file existence
    if (existsSync(DB_FILE_PATH)) {
      console.log(`Found database file at path: ${DB_FILE_PATH}. Opening existing database.`);
    } else {
      console.log(`Could not find database file at path: ${DB_FILE_PATH}. Creating new empty database.`);
    }
    // Constructor
    console.log("Running SQLite constructor...");
    this.db = new DatabaseConstructor(DB_FILE_PATH);
    console.log("SQLite constructor completed.");
    // Configuration
    console.log("Setting WAL journal mode.");
    this.db.pragma("journal_mode = WAL");
    console.log(`Journal mode: ${this.db.pragma("journal_mode", { simple: true }) as SQLiteJournalMode}.`);
    const SQLITE_VERSION: SQLiteVersion = this.db.prepare("SELECT sqlite_version() AS version").get() as SQLiteVersion;
    console.log(`SQLite version: ${SQLITE_VERSION.version}.`);
    this.initialiseUsersTable();
    console.log("SQLite user storage ready.");
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
    console.log("Closing SQLite user storage database.");
    this.db.close();
    return true;
  }

  private initialiseUsersTable(): void {
    const SELECT_USERS_TABLE_SQL = `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`;
    const doesUsersTableExist: boolean = this.db.prepare(SELECT_USERS_TABLE_SQL).get() !== undefined;
    if (doesUsersTableExist) {
      console.log("Found users table.");
    } else {
      console.log("Did not find users table. Creating...");
      const CREATE_USERS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
      `;
      this.db.prepare(CREATE_USERS_TABLE_SQL).run();
      console.log("Created users table.");
    }
  }
}
