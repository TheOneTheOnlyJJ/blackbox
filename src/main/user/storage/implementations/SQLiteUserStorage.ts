import { IUser, UserId } from "../../IUser";
import { BaseUserStorageConfig, UserStorage } from "../UserStorage";
import DatabaseConstructor, { Database } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { JSONSchemaType } from "ajv";
import { UserStorageType } from "../UserStorageType";

export interface SQLiteUserStorageConfig extends BaseUserStorageConfig {
  type: UserStorageType.SQLite;
  dbDirPath: string;
  dbFileName: string;
}

type SQLiteJournalMode = string;

interface SQLiteVersion {
  version: string;
}

export class SQLiteUserStorage extends UserStorage<SQLiteUserStorageConfig> {
  public static readonly CONFIG_SCHEMA: JSONSchemaType<SQLiteUserStorageConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [UserStorageType.SQLite]
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

  public constructor(config: SQLiteUserStorageConfig, logger: LogFunctions) {
    super(config, SQLiteUserStorage.CONFIG_SCHEMA, logger);
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
    this.logger.info('"SQLite" user storage ready.');
  }

  public isUsernameAvailable(username: string): boolean {
    // TODO: Implement this properly
    this.logger.debug(`Checking username availability for username: "${username}".`);
    const IS_USERNAME_AVAILABLE_SQL = "SELECT COUNT(*) AS count FROM users WHERE username = ?";
    const RESULT = this.db.prepare(IS_USERNAME_AVAILABLE_SQL).get(username) as { count: number };
    if (RESULT.count > 0) {
      this.logger.debug("Username unavailable.");
      return false;
    }
    this.logger.debug("Username available.");
    return true;
  }

  public addUser(userData: IUser): boolean {
    this.logger.debug(`Adding new user.`);
    this.logger.silly(`User data: ${JSON.stringify(userData, null, 2)}.`);
    const INSERT_NEW_USER_SQL = "INSERT INTO users (id, username, password, password_salt) VALUES (@id, @username, @passwordHash, @passwordSalt)";
    try {
      const INFO: DatabaseConstructor.RunResult = this.db.prepare(INSERT_NEW_USER_SQL).run(userData);
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
      passwordHash: "test",
      passwordSalt: "salted password"
    };
  }

  public getUsers(userIds: UserId[]): IUser[] {
    return [
      {
        id: "",
        username: "test",
        passwordHash: "test",
        passwordSalt: "salted pass"
      }
    ];
  }

  public getAllUsers(): IUser[] {
    return [
      {
        id: "",
        username: "test",
        passwordHash: "test",
        passwordSalt: "salted caramel yummy"
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
        password TEXT NOT NULL,
        password_salt TEXT NOT NULL
      )
      `;
      this.db.prepare(CREATE_USERS_TABLE_SQL).run();
      this.logger.debug('Created "users" table.');
    }
  }
}
